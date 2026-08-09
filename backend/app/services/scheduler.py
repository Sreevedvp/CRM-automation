import datetime
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models import ScheduledEmail, MessageLog, Lead
from app.services.messaging import messaging_service

logger = logging.getLogger("crm.scheduler")
scheduler = BackgroundScheduler()

def process_due_scheduled_emails():
    """Background worker checking and delivering due scheduled emails."""
    db = SessionLocal()
    try:
        # Use local system time matching datetime-local input from browser
        now = datetime.datetime.now()
        due_emails = db.query(ScheduledEmail).filter(
            ScheduledEmail.status == "pending",
            ScheduledEmail.scheduled_at <= now
        ).all()

        if not due_emails:
            return

        logger.info(f"Processing {len(due_emails)} due scheduled email(s)...")

        for item in due_emails:
            try:
                # Dispatch real SMTP email
                success, detail = messaging_service.send_real_smtp_email(
                    to_email=item.recipient_email,
                    subject=item.subject,
                    body_text=item.content
                )

                if success:
                    item.status = "sent"
                    # Log message in lead history if linked to a lead
                    if item.lead_id:
                        log = MessageLog(
                            lead_id=item.lead_id,
                            channel="email",
                            template_used=item.template_name,
                            content=f"Subject: {item.subject}\n\n{item.content}",
                            status="sent",
                            direction="outbound"
                        )
                        db.add(log)
                else:
                    item.status = "failed"
                    logger.error(f"Scheduled email #{item.id} delivery failed: {detail}")

            except Exception as e:
                item.status = "failed"
                logger.error(f"Error processing scheduled email #{item.id}: {e}")

        db.commit()
    except Exception as exc:
        logger.error(f"Error in process_due_scheduled_emails worker: {exc}")
    finally:
        db.close()

def start_scheduler():
    """Initialize and start the background scheduler."""
    if not scheduler.running:
        scheduler.add_job(
            process_due_scheduled_emails,
            trigger="interval",
            seconds=10,
            id="scheduled_email_worker",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Background Email APScheduler service started successfully.")
