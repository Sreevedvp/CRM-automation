import datetime
import concurrent.futures
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models import Lead, AutomationRun, MessageLog, Customer, ScheduledEmail
from app.schemas import (
    LeadResponse, LeadStatusUpdateRequest, AutomationRunResponse,
    MessageLogResponse, CustomerResponse, BatchEmailRequest, ScheduledEmailResponse
)
from app.services.workflow import workflow_engine
from app.services.messaging import messaging_service

router = APIRouter(prefix="/api/leads", tags=["Leads Console"])

@router.get("", response_model=List[LeadResponse])
def get_leads(
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    db: Session = Depends(get_db)
):
    query = db.query(Lead)
    if status:
        query = query.filter(Lead.status == status)
    if search:
        query = query.filter(
            (Lead.name.ilike(f"%{search}%")) |
            (Lead.phone.ilike(f"%{search}%")) |
            (Lead.email.ilike(f"%{search}%"))
        )
    return query.order_by(Lead.updated_at.desc()).all()

@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.converted_at.desc()).all()

@router.get("/email-tracker/customers")
def get_customer_email_tracker(db: Session = Depends(get_db)):
    """
    Returns email logs grouped per customer/lead, including brief previews, total sent,
    delivery statuses, and last sent timestamp.
    """
    leads = db.query(Lead).order_by(Lead.updated_at.desc()).all()
    results = []

    for lead in leads:
        messages = db.query(MessageLog).filter(
            MessageLog.lead_id == lead.id,
            MessageLog.channel == "email"
        ).order_by(MessageLog.timestamp.desc()).all()

        total_sent = len(messages)
        last_msg = messages[0] if messages else None

        results.append({
            "lead_id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "status": lead.status,
            "total_emails_sent": total_sent,
            "last_sent_at": last_msg.timestamp if last_msg else lead.updated_at,
            "last_status": last_msg.status if last_msg else "no_emails",
            "last_subject_preview": last_msg.content.split("\n")[0] if last_msg else "No emails sent yet",
            "history": [
                {
                    "id": m.id,
                    "content": m.content,
                    "status": m.status,
                    "direction": m.direction,
                    "timestamp": m.timestamp
                } for m in messages
            ]
        })

    return results

@router.get("/scheduled-queue", response_model=List[ScheduledEmailResponse])
def get_scheduled_queue(db: Session = Depends(get_db)):
    """Fetch pending scheduled emails queue."""
    return db.query(ScheduledEmail).filter(
        ScheduledEmail.status == "pending"
    ).order_by(ScheduledEmail.scheduled_at.asc()).all()

@router.delete("/scheduled-queue/{schedule_id}")
def cancel_scheduled_email(schedule_id: int, db: Session = Depends(get_db)):
    """
    Cancels a pending scheduled email and all associated emails in the same campaign batch.
    """
    item = db.query(ScheduledEmail).filter(ScheduledEmail.id == schedule_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scheduled email not found.")

    cancelled_ids = []

    if item.batch_id:
        # Cancel all pending emails sharing this batch_id
        batch_items = db.query(ScheduledEmail).filter(
            ScheduledEmail.batch_id == item.batch_id,
            ScheduledEmail.status == "pending"
        ).all()
        for b_item in batch_items:
            b_item.status = "cancelled"
            cancelled_ids.append(b_item.id)
    else:
        # Fallback: cancel all pending emails sharing exact same schedule time and subject
        batch_items = db.query(ScheduledEmail).filter(
            ScheduledEmail.scheduled_at == item.scheduled_at,
            ScheduledEmail.subject == item.subject,
            ScheduledEmail.status == "pending"
        ).all()
        if batch_items:
            for b_item in batch_items:
                b_item.status = "cancelled"
                cancelled_ids.append(b_item.id)
        else:
            item.status = "cancelled"
            cancelled_ids.append(item.id)

    db.commit()
    return {"success": True, "cancelled_ids": cancelled_ids}

def _send_single_batch_email(recipient_data: dict, subject: str, content: str, template_name: str):
    """
    Worker function executed concurrently in thread pool for simultaneous email dispatch.
    """
    db = SessionLocal()
    try:
        # Check or create lead
        existing_lead = db.query(Lead).filter(Lead.email == recipient_data["email"]).first()
        if not existing_lead:
            existing_lead = Lead(
                name=recipient_data["name"],
                email=recipient_data["email"],
                phone=recipient_data.get("phone") or "+15550000000",
                source="batch_preset_campaign",
                status="hot",
                score=80.0
            )
            db.add(existing_lead)
            db.commit()
            db.refresh(existing_lead)

        # Personalize content
        personalized_body = content.replace("{name}", existing_lead.name).replace("{email}", existing_lead.email)
        
        # Dispatch email
        log = messaging_service.send_email(
            db=db,
            lead=existing_lead,
            subject=subject,
            body=personalized_body,
            template_name=template_name
        )

        return {
            "email": existing_lead.email,
            "name": existing_lead.name,
            "status": log.status,
            "log_id": log.id
        }
    except Exception as e:
        return {
            "email": recipient_data["email"],
            "name": recipient_data["name"],
            "status": "failed",
            "error": str(e)
        }
    finally:
        db.close()

@router.post("/batch-send")
def batch_send_emails(payload: BatchEmailRequest, db: Session = Depends(get_db)):
    """
    Dispatches emails immediately OR schedules them for future execution.
    """
    if not payload.recipients:
        raise HTTPException(status_code=400, detail="Recipients list cannot be empty.")

    # Check if this is a Scheduled Send
    if payload.schedule_at:
        try:
            clean_time_str = payload.schedule_at.replace("Z", "")
            target_dt = datetime.datetime.fromisoformat(clean_time_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid schedule_at format. Use YYYY-MM-DDTHH:MM")

        # Generate unique campaign batch ID
        batch_id = f"batch_{int(datetime.datetime.now().timestamp())}_{len(payload.recipients)}"

        scheduled_records = []
        for r in payload.recipients:
            lead = db.query(Lead).filter(Lead.email == r.email).first()
            personalized_body = payload.content.replace("{name}", r.name).replace("{email}", r.email)
            
            sch = ScheduledEmail(
                batch_id=batch_id,
                lead_id=lead.id if lead else None,
                recipient_name=r.name,
                recipient_email=r.email,
                subject=payload.subject,
                content=personalized_body,
                template_name=payload.template_name or "preset_campaign",
                scheduled_at=target_dt,
                status="pending"
            )
            db.add(sch)
            scheduled_records.append(sch)

        db.commit()

        return {
            "success": True,
            "mode": "scheduled",
            "batch_id": batch_id,
            "scheduled_at": target_dt.isoformat(),
            "total_scheduled": len(scheduled_records)
        }

    # Otherwise, Instant Send (Now)
    recipients_list = [r.dict() for r in payload.recipients]
    results = []

    # Execute concurrent dispatch in thread pool for simultaneous sending
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(
                _send_single_batch_email,
                rec_data,
                payload.subject,
                payload.content,
                payload.template_name or "preset_campaign"
            )
            for rec_data in recipients_list
        ]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    success_count = sum(1 for r in results if r["status"] == "sent")
    failed_count = sum(1 for r in results if r["status"] != "sent")

    return {
        "success": True,
        "mode": "instant",
        "total_dispatched": len(results),
        "sent_successfully": success_count,
        "failed": failed_count,
        "details": results
    }

@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead_by_id(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/{lead_id}/action")
def update_lead_sales_action(lead_id: int, payload: LeadStatusUpdateRequest, db: Session = Depends(get_db)):
    try:
        lead = workflow_engine.update_lead_sales_action(
            db,
            lead_id=lead_id,
            action=payload.status,
            reason=payload.reason,
            assigned_to=payload.assigned_to
        )
        return {
            "success": True,
            "lead_id": lead.id,
            "new_status": lead.status,
            "assigned_to": lead.assigned_to
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{lead_id}/audit", response_model=List[AutomationRunResponse])
def get_lead_audit_trail(lead_id: int, db: Session = Depends(get_db)):
    return db.query(AutomationRun).filter(AutomationRun.lead_id == lead_id).order_by(AutomationRun.timestamp.desc()).all()

@router.get("/{lead_id}/messages", response_model=List[MessageLogResponse])
def get_lead_messages(lead_id: int, db: Session = Depends(get_db)):
    return db.query(MessageLog).filter(MessageLog.lead_id == lead_id).order_by(MessageLog.timestamp.asc()).all()
