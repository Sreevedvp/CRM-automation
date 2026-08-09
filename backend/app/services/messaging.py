import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import MessageLog, Lead, EmailConfig
from app.config import settings

class MessagingService:
    """
    Handles Real Email Delivery via SMTP (configured in database or environment)
    """

    def get_smtp_credentials(self):
        """
        Retrieves SMTP configuration from database table EmailConfig first,
        falling back to environment settings.
        """
        db = SessionLocal()
        try:
            conf = db.query(EmailConfig).first()
            if conf and conf.smtp_user and conf.smtp_password:
                return {
                    "host": conf.smtp_host or "smtp.gmail.com",
                    "port": conf.smtp_port or 587,
                    "user": conf.smtp_user,
                    "password": conf.smtp_password,
                    "tls": conf.smtp_tls,
                    "from": conf.email_from or conf.smtp_user
                }
        except Exception:
            pass
        finally:
            db.close()

        # Fallback to settings / env
        return {
            "host": settings.SMTP_HOST or "smtp.gmail.com",
            "port": settings.SMTP_PORT or 587,
            "user": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "tls": settings.SMTP_TLS,
            "from": settings.EMAIL_FROM or settings.SMTP_USER
        }

    def send_real_smtp_email(self, to_email: str, subject: str, body_text: str, html_body: str = None) -> tuple[bool, str]:
        """
        Sends an actual email via SMTP.
        Returns (success: bool, detail_message: str)
        """
        creds = self.get_smtp_credentials()
        smtp_user = creds["user"]
        smtp_password = creds["password"]
        sender_email = creds["from"] or smtp_user
        smtp_host = creds["host"]
        smtp_port = creds["port"]

        if not smtp_user or not smtp_password:
            return False, "SMTP credentials missing. Please configure SMTP in settings."

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.PROJECT_NAME} <{sender_email}>"
            msg["To"] = to_email

            # Attach plain text
            msg.attach(MIMEText(body_text, "plain"))

            # Attach HTML if provided
            if html_body:
                msg.attach(MIMEText(html_body, "html"))
            else:
                formatted_html = f"""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <div style="background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px 6px 0 0; font-weight: bold; font-size: 18px;">
                    {settings.PROJECT_NAME}
                  </div>
                  <div style="padding: 20px 0; line-height: 1.6; white-space: pre-wrap;">
                    {body_text}
                  </div>
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #64748b;">
                    Sent via CRM Automation Engine
                  </div>
                </div>
                """
                msg.attach(MIMEText(formatted_html, "html"))

            # Connect to SMTP server
            if smtp_port == 465:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
                if creds["tls"]:
                    server.starttls()

            server.login(smtp_user, smtp_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
            server.quit()

            return True, f"Real email delivered to {to_email} via {smtp_host}"

        except Exception as e:
            return False, f"SMTP Error: {str(e)}"

    def send_email(self, db: Session, lead: Lead, subject: str, body: str, template_name: str = None) -> MessageLog:
        """
        Dispatches email to recipient. Attempts real SMTP delivery if enabled,
        and logs full delivery audit record in MessageLog.
        """
        success, detail = self.send_real_smtp_email(lead.email, subject, body)
        status_code = "sent" if success else "failed"

        log_content = f"Subject: {subject}\n\n{body}"
        if not success:
            log_content += f"\n\n[Delivery Status: {detail}]"

        log = MessageLog(
            lead_id=lead.id,
            channel="email",
            template_used=template_name or "transactional_email",
            content=log_content,
            status=status_code,
            direction="outbound",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(log)
        lead.last_contacted_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(log)
        return log

messaging_service = MessagingService()
