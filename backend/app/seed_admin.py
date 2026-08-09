import os
import hashlib
from app.database import engine, Base, SessionLocal
from app.models import User, EmailConfig

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def seed_database():
    print("Running database migrations and creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin_name = os.getenv("ADMIN_NAME", "Alex Rivera (System Admin)")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@company.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "adminpassword")

        # Seed Admin Account if empty
        if db.query(User).filter(User.email == admin_email).count() == 0:
            admin_user = User(
                name=admin_name,
                email=admin_email,
                password_hash=hash_pw(admin_password),
                role="admin"
            )
            db.add(admin_user)
            print(f"Created Admin User: {admin_email}")

        # Seed Staff Account if empty
        if db.query(User).filter(User.email == "sarah.chen@company.com").count() == 0:
            staff_user = User(
                name="Sarah Chen (Sales Rep)",
                email="sarah.chen@company.com",
                password_hash=hash_pw("staffpassword"),
                role="staff"
            )
            db.add(staff_user)
            print("Created Staff User: sarah.chen@company.com")

        # Seed Email Config in DB if empty and credentials provided
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASSWORD", "")
        if db.query(EmailConfig).count() == 0 and smtp_user:
            email_conf = EmailConfig(
                id=1,
                smtp_host=os.getenv("SMTP_HOST", "smtp.gmail.com"),
                smtp_port=int(os.getenv("SMTP_PORT", 587)),
                smtp_user=smtp_user,
                smtp_password=smtp_pass,
                smtp_tls=True,
                email_from=os.getenv("EMAIL_FROM", smtp_user),
                is_configured=True
            )
            db.add(email_conf)
            print("Created default Email SMTP Config in database!")

        db.commit()
        print("Database seed migration completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
