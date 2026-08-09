from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LeadIntakeRequest, LeadResponse, InboundMessageRequest
from app.services.workflow import workflow_engine

router = APIRouter(prefix="/api/intake", tags=["Intake & Webhooks"])

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def intake_lead(payload: LeadIntakeRequest, db: Session = Depends(get_db)):
    """
    Primary Lead Intake Webhook / REST API.
    Validates, Deduplicates, Scores, Classifies (Hot/Warm/Cold), and dispatches automated actions.
    """
    try:
        lead, result_type = workflow_engine.process_intake(db, payload.dict())
        return lead
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal intake error: {str(e)}")

@router.post("/inbound-reply")
def inbound_reply_webhook(payload: InboundMessageRequest, db: Session = Depends(get_db)):
    """
    Inbound WhatsApp / Email reply webhook.
    Triggers hard interrupt: stops all scheduled automated messages, changes status to 'replied',
    runs AI intent analysis, and alerts assigned sales rep.
    """
    try:
        lead, status_msg = workflow_engine.handle_inbound_reply(
            db,
            phone_or_email=payload.phone_or_email,
            channel=payload.channel,
            message_text=payload.content
        )
        return {
            "success": True,
            "message": status_msg,
            "lead_id": lead.id,
            "lead_status": lead.status,
            "ai_intent": lead.ai_intent,
            "ai_suggested_reply": lead.ai_suggested_reply
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inbound webhook failure: {str(e)}")
