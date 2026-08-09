from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Lead
from app.ai.engine import ai_engine

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence Engine"])

class SmartReplyRequest(BaseModel):
    lead_id: int
    channel: str = "whatsapp"
    last_message: str

class IntentAnalysisRequest(BaseModel):
    text: str

@router.post("/smart-reply")
def generate_smart_reply(payload: SmartReplyRequest, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == payload.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    reply = ai_engine.generate_smart_reply(lead.name, payload.channel, payload.last_message, lead.status)
    return {
        "lead_id": lead.id,
        "channel": payload.channel,
        "suggested_reply": reply,
        "ai_engine": ai_engine.provider
    }

@router.post("/intent")
def analyze_intent(payload: IntentAnalysisRequest):
    analysis = ai_engine.analyze_lead_intent_and_sentiment(payload.text)
    return analysis
