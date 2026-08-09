import hashlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Lead, Task, Customer, MessageLog, AutomationRun, User, ScheduledEmail
from app.routers import intake, leads, tasks, ai, auth, settings as settings_router
from app.services.scheduler import start_scheduler

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CRM Lead Automation System with State Machine, Real Email (SMTP), and Scheduled Dispatch Engine",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(intake.router)
app.include_router(leads.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(settings_router.router)

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@app.on_event("startup")
def startup_event():
    # Start background email scheduler
    start_scheduler()

    # Seed initial Admin & Staff accounts
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            sample_users = [
                User(name="Alex Rivera (System Admin)", email="admin@company.com", password_hash=hash_pw("adminpassword"), role="admin"),
                User(name="Sarah Chen (Sales Rep)", email="sarah.chen@company.com", password_hash=hash_pw("staffpassword"), role="staff"),
            ]
            db.add_all(sample_users)
            db.commit()
            print("Seeded initial Admin and Staff user accounts!")
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "email_smtp_configured": bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
    }
