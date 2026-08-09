const API_BASE = "http://localhost:8000/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  score: number;
  score_breakdown?: Record<string, number>;
  assigned_to?: string;
  not_interested_reason?: string;
  ai_summary?: string;
  ai_intent?: string;
  ai_suggested_reply?: string;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
}

export interface CustomerEmailRecord {
  lead_id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  total_emails_sent: number;
  last_sent_at: string;
  last_status: string;
  last_subject_preview: string;
  history: {
    id: number;
    content: string;
    status: string;
    direction: string;
    timestamp: string;
  }[];
}

export interface ScheduledEmailItem {
  id: number;
  lead_id?: number;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  content: string;
  template_name?: string;
  scheduled_at: string;
  status: string;
  created_at: string;
}

export interface Task {
  id: number;
  lead_id: number;
  type: string;
  title: string;
  due_date: string;
  status: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

export interface Customer {
  id: number;
  linked_lead_id: number;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  converted_at: string;
}

export interface AutomationRun {
  id: number;
  lead_id: number;
  trigger: string;
  actions_executed: string[];
  success: boolean;
  error_message?: string;
  timestamp: string;
}

export interface MessageLog {
  id: number;
  lead_id: number;
  channel: string;
  template_used?: string;
  content: string;
  status: string;
  direction: string;
  timestamp: string;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Authentication failed");
  }
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createStaffUser(name: string, email: string, password: string, role: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create user account");
  }
  return res.json();
}

export async function fetchEmailSettings() {
  const res = await fetch(`${API_BASE}/settings/email`);
  if (!res.ok) throw new Error("Failed to fetch email settings");
  return res.json();
}

export async function updateEmailSettings(payload: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_tls: boolean;
  email_from: string;
}) {
  const res = await fetch(`${API_BASE}/settings/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update email settings");
  }
  return res.json();
}

export async function sendTestEmail(toEmail: string, subject?: string, message?: string) {
  const res = await fetch(`${API_BASE}/settings/email/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to_email: toEmail, subject, message }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Test email delivery failed");
  }
  return res.json();
}

export async function fetchCustomerEmailTracker(): Promise<CustomerEmailRecord[]> {
  const res = await fetch(`${API_BASE}/leads/email-tracker/customers`);
  if (!res.ok) throw new Error("Failed to fetch customer email tracking logs");
  return res.json();
}

export async function fetchScheduledQueue(): Promise<ScheduledEmailItem[]> {
  const res = await fetch(`${API_BASE}/leads/scheduled-queue`);
  if (!res.ok) throw new Error("Failed to fetch scheduled email queue");
  return res.json();
}

export async function cancelScheduledEmail(scheduleId: number) {
  const res = await fetch(`${API_BASE}/leads/scheduled-queue/${scheduleId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to cancel scheduled email");
  return res.json();
}

export async function sendBatchEmailPreset(payload: {
  recipients: { name: string; email: string; phone?: string }[];
  subject: string;
  content: string;
  template_name?: string;
  schedule_at?: string;
}) {
  const res = await fetch(`${API_BASE}/leads/batch-send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Batch preset email delivery failed");
  }
  return res.json();
}

export async function fetchLeads(statusFilter?: string, search?: string): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
  if (search) params.append("search", search);
  const res = await fetch(`${API_BASE}/leads?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/leads/customers`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function fetchAuditTrail(leadId: number): Promise<AutomationRun[]> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/audit`);
  if (!res.ok) throw new Error("Failed to fetch audit trail");
  return res.json();
}

export async function fetchMessageLogs(leadId: number): Promise<MessageLog[]> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch message logs");
  return res.json();
}

export async function createIntakeLead(payload: any): Promise<Lead> {
  const res = await fetch(`${API_BASE}/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Intake submission failed");
  }
  return res.json();
}

export async function triggerInboundReply(phoneOrEmail: string, channel: string, content: string) {
  const res = await fetch(`${API_BASE}/intake/inbound-reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_or_email: phoneOrEmail, channel, content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Inbound reply trigger failed");
  }
  return res.json();
}

export async function updateLeadSalesAction(leadId: number, status: string, reason?: string, assignedTo?: string) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason, assigned_to: assignedTo }),
  });
  if (!res.ok) throw new Error("Sales action update failed");
  return res.json();
}

export async function completeTask(taskId: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Task completion failed");
  return res.json();
}

export async function generateAISmartReply(leadId: number, channel: string, lastMessage: string) {
  const res = await fetch(`${API_BASE}/ai/smart-reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead_id: leadId, channel, last_message: lastMessage }),
  });
  if (!res.ok) throw new Error("AI Smart Reply failed");
  return res.json();
}
