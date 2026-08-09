import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="staff", nullable=False) # admin | staff
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EmailConfig(Base):
    __tablename__ = "email_configs"

    id = Column(Integer, primary_key=True, default=1)
    smtp_host = Column(String(255), default="smtp.gmail.com")
    smtp_port = Column(Integer, default=587)
    smtp_user = Column(String(255), nullable=True)
    smtp_password = Column(String(255), nullable=True)
    smtp_tls = Column(Boolean, default=True)
    email_from = Column(String(255), nullable=True)
    is_configured = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=False)
    source = Column(String(100), default="website")
    raw_payload = Column(JSON, nullable=True)
    
    # Status: new | validated | duplicate | hot | warm | cold | replied | interested | converted | not_interested | nurture
    status = Column(String(50), default="new", index=True)
    score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, nullable=True)
    
    assigned_to = Column(String(100), nullable=True)
    not_interested_reason = Column(Text, nullable=True)
    
    # AI Powered fields (Space for AI)
    ai_summary = Column(Text, nullable=True)
    ai_intent = Column(String(100), nullable=True)
    ai_suggested_reply = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_contacted_at = Column(DateTime, nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="lead", cascade="all, delete-orphan")
    message_logs = relationship("MessageLog", back_populates="lead", cascade="all, delete-orphan")
    automation_runs = relationship("AutomationRun", back_populates="lead", cascade="all, delete-orphan")
    customer_profile = relationship("Customer", back_populates="linked_lead", uselist=False)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    linked_lead_id = Column(Integer, ForeignKey("leads.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    converted_at = Column(DateTime, default=datetime.datetime.utcnow)

    linked_lead = relationship("Lead", back_populates="customer_profile")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    type = Column(String(50), default="follow_up") # follow_up | call | site_visit
    title = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending") # pending | completed | cancelled
    assigned_to = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="tasks")

class MessageLog(Base):
    __tablename__ = "message_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    channel = Column(String(50), nullable=False) # whatsapp | email
    template_used = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(String(50), default="sent") # queued | sent | delivered | read | failed | interrupted
    direction = Column(String(50), default="outbound") # outbound | inbound
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="message_logs")

class ScheduledEmail(Base):
    __tablename__ = "scheduled_emails"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(100), nullable=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    recipient_name = Column(String(255), nullable=False)
    recipient_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    template_name = Column(String(100), nullable=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    status = Column(String(50), default="pending", index=True) # pending | sent | cancelled | failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AutomationRun(Base):
    __tablename__ = "automation_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    trigger = Column(String(100), nullable=False)
    actions_executed = Column(JSON, nullable=False)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="automation_runs")
