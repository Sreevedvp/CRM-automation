import os
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import EmailConfig
from app.services.messaging import messaging_service

router = APIRouter(prefix="/api/settings", tags=["Email & Integration Settings"])

class EmailSettingsUpdate(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    smtp_tls: bool = True
    email_from: str

class TestEmailRequest(BaseModel):
    to_email: str
    subject: str = "CRM Real Delivery Verification"
    message: str = "Hello! This is a test email from your CRM Automation Engine verifying real email delivery."

def get_or_create_email_config(db: Session) -> EmailConfig:
    conf = db.query(EmailConfig).first()
    if not conf:
        conf = EmailConfig(
            id=1,
            smtp_host=settings.SMTP_HOST or "smtp.gmail.com",
            smtp_port=settings.SMTP_PORT or 587,
            smtp_user=settings.SMTP_USER,
            smtp_password=settings.SMTP_PASSWORD,
            smtp_tls=settings.SMTP_TLS,
            email_from=settings.EMAIL_FROM or settings.SMTP_USER,
            is_configured=bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
        )
        db.add(conf)
        db.commit()
        db.refresh(conf)
    return conf

@router.get("/email")
def get_email_settings(db: Session = Depends(get_db)):
    conf = get_or_create_email_config(db)
    return {
        "smtp_host": conf.smtp_host,
        "smtp_port": conf.smtp_port,
        "smtp_user": conf.smtp_user or "",
        "email_from": conf.email_from or conf.smtp_user or "",
        "is_configured": bool(conf.smtp_user and conf.smtp_password)
    }

@router.post("/email")
def update_email_settings(payload: EmailSettingsUpdate, db: Session = Depends(get_db)):
    conf = get_or_create_email_config(db)
    conf.smtp_host = payload.smtp_host
    conf.smtp_port = payload.smtp_port
    conf.smtp_user = payload.smtp_user
    conf.smtp_password = payload.smtp_password
    conf.smtp_tls = payload.smtp_tls
    conf.email_from = payload.email_from or payload.smtp_user
    conf.is_configured = True

    db.commit()

    # Also sync in-memory settings
    settings.SMTP_HOST = payload.smtp_host
    settings.SMTP_PORT = payload.smtp_port
    settings.SMTP_USER = payload.smtp_user
    settings.SMTP_PASSWORD = payload.smtp_password
    settings.EMAIL_FROM = payload.email_from or payload.smtp_user

    return {
        "success": True,
        "message": "Email SMTP settings saved permanently to database!",
        "is_configured": True
    }

@router.post("/email/test")
def send_test_email(payload: TestEmailRequest):
    """
    Sends an immediate test email to verify SMTP credentials.
    """
    success, detail = messaging_service.send_real_smtp_email(
        to_email=payload.to_email,
        subject=payload.subject,
        body_text=payload.message
    )
    
    if not success:
        if "535" in detail or "BadCredentials" in detail or "Username and Password not accepted" in detail:
            error_explanation = (
                "Google rejected your password (535 BadCredentials). "
                "Gmail requires a 16-character App Password (not your regular account password). "
                "Go to https://myaccount.google.com/apppasswords to generate one and paste it here."
            )
        else:
            error_explanation = detail

        raise HTTPException(status_code=400, detail=error_explanation)
    
    return {
        "success": True,
        "message": f"Test email successfully delivered to {payload.to_email}!",
        "detail": detail
    }
