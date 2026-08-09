import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User & Auth Schemas
class UserLoginRequest(BaseModel):
    email: str = Field(..., example="admin@company.com")
    password: str = Field(..., example="adminpassword")

class UserCreateRequest(BaseModel):
    name: str = Field(..., example="Sarah Chen")
    email: str = Field(..., example="sarah@company.com")
    password: str = Field(..., example="staffpassword")
    role: str = Field("staff", example="staff") # admin | staff

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Lead Schemas
class LeadIntakeRequest(BaseModel):
    name: str = Field(..., example="John Doe")
    phone: str = Field(..., example="+14155552671")
    email: str = Field(..., example="john@example.com")
    source: Optional[str] = "website"
    budget: Optional[float] = 0.0
    intent_signals: Optional[List[str]] = []
    company_size: Optional[str] = None
    notes: Optional[str] = None
    raw_payload: Optional[Dict[str, Any]] = None

class LeadResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    source: str
    status: str
    score: float
    score_breakdown: Optional[Dict[str, Any]] = None
    assigned_to: Optional[str] = None
    not_interested_reason: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_intent: Optional[str] = None
    ai_suggested_reply: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    last_contacted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    lead_id: int
    type: str = "follow_up" # follow_up | call | site_visit
    title: str
    due_date: datetime.datetime
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    lead_id: int
    type: str
    title: str
    due_date: datetime.datetime
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# MessageLog Schemas
class InboundMessageRequest(BaseModel):
    phone_or_email: str
    channel: str # whatsapp | email
    content: str

class MessageLogResponse(BaseModel):
    id: int
    lead_id: int
    channel: str
    template_used: Optional[str] = None
    content: str
    status: str
    direction: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Batch Email Presets Broadcast Request
class RecipientItem(BaseModel):
    name: str
    email: str
    phone: Optional[str] = "+15550000000"

class BatchEmailRequest(BaseModel):
    recipients: List[RecipientItem]
    subject: str
    content: str
    template_name: Optional[str] = "preset_campaign"
    schedule_at: Optional[str] = None # ISO format timestamp if scheduled

class ScheduledEmailResponse(BaseModel):
    id: int
    batch_id: Optional[str] = None
    lead_id: Optional[int] = None
    recipient_name: str
    recipient_email: str
    subject: str
    content: str
    template_name: Optional[str] = None
    scheduled_at: datetime.datetime
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# AutomationRun Schemas
class AutomationRunResponse(BaseModel):
    id: int
    lead_id: int
    trigger: str
    actions_executed: Any
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Customer Schema
class CustomerResponse(BaseModel):
    id: int
    linked_lead_id: int
    name: str
    phone: str
    email: str
    company: Optional[str] = None
    notes: Optional[str] = None
    converted_at: datetime.datetime

    class Config:
        from_attributes = True

# Status Update Request
class LeadStatusUpdateRequest(BaseModel):
    status: str # interested | converted | not_interested
    reason: Optional[str] = None
    assigned_to: Optional[str] = None
