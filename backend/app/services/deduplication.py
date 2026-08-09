from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models import Lead, MessageLog, AutomationRun
import datetime

def find_duplicate_lead(db: Session, phone: str, email: str, name: str) -> Tuple[Optional[Lead], str]:
    """
    Checks if lead already exists in DB.
    Match strategy:
    1. Primary: Exact Phone match
    2. Fallback: Exact Email match or Name + Email domain fuzzy match
    Returns (existing_lead_or_none, match_type)
    """
    # 1. Exact phone match
    existing = db.query(Lead).filter(Lead.phone == phone).first()
    if existing:
        return existing, "exact_phone"

    # 2. Exact email match
    existing = db.query(Lead).filter(Lead.email == email).first()
    if existing:
        return existing, "exact_email"

    # 3. Fuzzy match: same name + email
    existing = db.query(Lead).filter(Lead.name.ilike(name), Lead.email.ilike(email)).first()
    if existing:
        return existing, "fuzzy_name_email"

    return None, "none"

def merge_duplicate_lead(db: Session, existing_lead: Lead, new_payload: dict, match_reason: str) -> Lead:
    """
    Merges duplicate lead activity/payload into existing lead record without restarting active automations.
    """
    # Record automation run merge event
    merge_log = AutomationRun(
        lead_id=existing_lead.id,
        trigger="duplicate_intake_merged",
        actions_executed={
            "match_reason": match_reason,
            "new_source": new_payload.get("source"),
            "merged_at": str(datetime.datetime.utcnow())
        },
        success=True
    )
    db.add(merge_log)
    
    # Update last contacted or payload if new info provided
    if new_payload.get("notes"):
        existing_lead.raw_payload = existing_lead.raw_payload or {}
        existing_lead.raw_payload["merged_notes"] = new_payload.get("notes")

    existing_lead.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(existing_lead)
    return existing_lead
