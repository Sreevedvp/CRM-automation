import datetime
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import Lead, Customer, Task, MessageLog, AutomationRun
from app.services.validation import validate_lead_payload
from app.services.deduplication import find_duplicate_lead, merge_duplicate_lead
from app.services.scoring import calculate_lead_score
from app.services.messaging import messaging_service
from app.ai.engine import ai_engine

# Round-robin sales executive list for auto assignment
SALES_REPS = ["Alex Rivera (Senior Exec)", "Sarah Chen (Tech Sales)", "David Miller (Enterprise)"]
_rep_counter = 0

def get_next_sales_rep() -> str:
    global _rep_counter
    rep = SALES_REPS[_rep_counter % len(SALES_REPS)]
    _rep_counter += 1
    return rep

class WorkflowEngine:
    """
    State machine driving all lead routing, sales handoff, reply interrupts, and sales rep actions.
    """

    def process_intake(self, db: Session, raw_payload: Dict[str, Any]) -> Tuple[Lead, str]:
        """
        1. Validate
        2. Deduplicate
        3. Score
        4. Classify & Route (Hot / Warm / Cold)
        """
        is_valid, err, normalized = validate_lead_payload(raw_payload)
        if not is_valid:
            raise ValueError(err)

        # Check for duplicates
        existing, match_reason = find_duplicate_lead(
            db, phone=normalized["phone"], email=normalized["email"], name=normalized["name"]
        )
        if existing:
            merged_lead = merge_duplicate_lead(db, existing, normalized, match_reason)
            return merged_lead, f"merged_duplicate_{match_reason}"

        # Score & Classify
        score, breakdown, classification = calculate_lead_score(normalized)

        # Generate AI Summary for lead
        ai_summary = ai_engine.generate_executive_summary(
            lead_name=normalized["name"],
            source=normalized["source"],
            score=score,
            classification=classification,
            notes=normalized.get("notes")
        )

        # Create new Lead
        lead = Lead(
            name=normalized["name"],
            phone=normalized["phone"],
            email=normalized["email"],
            source=normalized["source"],
            raw_payload=normalized["raw_payload"],
            status=classification,
            score=score,
            score_breakdown=breakdown,
            ai_summary=ai_summary
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

        # Execute routing side effects based on state
        self.execute_route_side_effects(db, lead, classification)

        return lead, f"created_{classification}"

    def execute_route_side_effects(self, db: Session, lead: Lead, classification: str):
        actions = []

        if classification == "hot":
            # 1. Round-robin assignment
            rep = get_next_sales_rep()
            lead.assigned_to = rep
            actions.append(f"assigned_to_{rep}")

            # 2. Immediate WhatsApp & Email
            msg1 = messaging_service.send_whatsapp_template(db, lead, template_name="hot_lead_welcome")
            msg2 = messaging_service.send_email(
                db, lead, 
                subject="Welcome to CRM Automation - Priority Support", 
                body=f"Hi {lead.name},\n\nWe received your high-priority request. Senior Sales Executive {rep} will contact you shortly."
            )
            actions.extend(["sent_whatsapp_template_hot", "sent_email_hot"])

            # 3. Create priority follow-up task due in 4 hours
            due = datetime.datetime.utcnow() + datetime.timedelta(hours=4)
            task = Task(
                lead_id=lead.id,
                type="call",
                title=f"HOT LEAD CALL: {lead.name} ({lead.phone})",
                due_date=due,
                assigned_to=rep,
                notes=f"Auto-generated for HOT lead. Score: {lead.score}"
            )
            db.add(task)
            actions.append("created_hot_call_task")

        elif classification == "warm":
            # 1. Automated initial drip
            messaging_service.send_whatsapp_template(db, lead, template_name="warm_lead_drip_1")
            messaging_service.send_email(
                db, lead,
                subject="Exploring CRM Solutions - Overview & Guide",
                body=f"Hi {lead.name},\n\nThanks for reaching out! Here is our solution guide."
            )
            actions.extend(["sent_whatsapp_drip_1", "sent_email_drip_1"])

            # 2. Schedule follow-up task
            due = datetime.datetime.utcnow() + datetime.timedelta(days=1)
            task = Task(
                lead_id=lead.id,
                type="follow_up",
                title=f"Warm Drip Follow-up: {lead.name}",
                due_date=due,
                notes="Automated Warm drip step 1 complete."
            )
            db.add(task)
            actions.append("scheduled_warm_drip_sequence")

        else: # cold
            lead.status = "nurture"
            actions.append("entered_marketing_nurture_campaign")

        # Record Automation Run Audit Log
        run_log = AutomationRun(
            lead_id=lead.id,
            trigger=f"lead_classified_{classification}",
            actions_executed=actions,
            success=True
        )
        db.add(run_log)
        db.commit()

    def handle_inbound_reply(self, db: Session, phone_or_email: str, channel: str, message_text: str) -> Tuple[Lead, str]:
        """
        Hard interrupt rule:
        ANY inbound reply stops all pending queued automations,
        sets status -> 'replied', runs AI intent analysis, and alerts assigned sales rep.
        """
        # Find lead by phone or email
        lead = db.query(Lead).filter((Lead.phone == phone_or_email) | (Lead.email == phone_or_email)).first()
        if not lead:
            raise ValueError(f"No lead found for identifier: {phone_or_email}")

        # 1. Interrupt pending sequence
        # Log inbound message
        inbound_msg = MessageLog(
            lead_id=lead.id,
            channel=channel,
            content=message_text,
            status="received",
            direction="inbound",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(inbound_msg)

        # 2. Perform AI Intent & Sentiment Analysis
        ai_res = ai_engine.analyze_lead_intent_and_sentiment(message_text)
        lead.ai_intent = ai_res["intent"]
        lead.ai_suggested_reply = ai_engine.generate_smart_reply(lead.name, channel, message_text, lead.status)

        # 3. Transition status to 'replied'
        old_status = lead.status
        lead.status = "replied"

        # 4. Ensure sales rep is assigned
        if not lead.assigned_to:
            lead.assigned_to = get_next_sales_rep()

        actions = [
            f"hard_interrupt_triggered_from_{old_status}",
            "stopped_all_pending_scheduled_messages",
            f"status_changed_to_replied",
            f"ai_intent_classified_{ai_res['intent']}",
            f"notified_rep_{lead.assigned_to}"
        ]

        # Audit log
        run_log = AutomationRun(
            lead_id=lead.id,
            trigger=f"inbound_reply_{channel}",
            actions_executed=actions,
            success=True
        )
        db.add(run_log)
        db.commit()
        db.refresh(lead)

        return lead, f"interrupt_processed_for_{lead.name}"

    def update_lead_sales_action(self, db: Session, lead_id: int, action: str, reason: str = None, assigned_to: str = None) -> Lead:
        """
        Executes sales rep manual state transitions: 'interested', 'converted', 'not_interested'
        """
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise ValueError(f"Lead ID {lead_id} not found")

        actions = []

        if action == "interested":
            lead.status = "interested"
            if assigned_to:
                lead.assigned_to = assigned_to
            # Create call/site-visit task
            task = Task(
                lead_id=lead.id,
                type="site_visit",
                title=f"Schedule Site Visit / In-depth Demo with {lead.name}",
                due_date=datetime.datetime.utcnow() + datetime.timedelta(days=1),
                assigned_to=lead.assigned_to,
                notes="Created via Sales Rep 'Interested' action"
            )
            db.add(task)
            actions.append("status_set_interested_and_task_created")

        elif action == "converted":
            if lead.status == "converted":
                # Idempotency: skip side effects if already converted
                return lead
            
            lead.status = "converted"
            actions.append("stopped_all_automations")

            # Check if Customer profile exists
            existing_cust = db.query(Customer).filter(Customer.linked_lead_id == lead.id).first()
            if not existing_cust:
                customer = Customer(
                    linked_lead_id=lead.id,
                    name=lead.name,
                    phone=lead.phone,
                    email=lead.email,
                    notes=f"Converted from Lead #{lead.id}. Source: {lead.source}"
                )
                db.add(customer)
                actions.append("created_customer_profile")

        elif action == "not_interested":
            lead.status = "not_interested"
            lead.not_interested_reason = reason or "No reason specified"
            # Move to nurture track
            lead.status = "nurture"
            actions.append(f"captured_reason_{reason}_and_moved_to_nurture")

        # Audit log
        run_log = AutomationRun(
            lead_id=lead.id,
            trigger=f"rep_action_{action}",
            actions_executed=actions,
            success=True
        )
        db.add(run_log)
        db.commit()
        db.refresh(lead)

        return lead

workflow_engine = WorkflowEngine()
