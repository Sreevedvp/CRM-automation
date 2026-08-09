const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // If served via Nginx or production proxy (port 80, 443, or relative)
    if (!window.location.port || window.location.port === "80" || window.location.port === "443") {
      return "/api";
    }
    // If served via Vite dev server on any network IP or domain (e.g. http://192.168.x.x:5173 -> http://192.168.x.x:8000/api)
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return "/api";
};

export const API_BASE = getApiBaseUrl();

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
  batch_id?: string;
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

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  email_from: string;
  is_configured: boolean;
}

// Authentication API calls
export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Authentication failed.");
  }
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/auth/users`);
  if (!res.ok) throw new Error("Failed to fetch users list.");
  return res.json();
}

export async function createUser(
  nameOrData: string | { name: string; email: string; password: string; role?: "admin" | "staff" },
  email?: string,
  password?: string,
  role: "admin" | "staff" = "staff"
): Promise<User> {
  const payload = typeof nameOrData === "object"
    ? nameOrData
    : { name: nameOrData, email: email!, password: password!, role };

  const res = await fetch(`${API_BASE}/auth/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create user.");
  }
  return res.json();
}

export const createStaffUser = createUser;

// Leads API calls
export async function fetchLeads(status?: string, search?: string): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const url = `${API_BASE}/leads${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchCustomerEmailTracker(): Promise<CustomerEmailRecord[]> {
  const res = await fetch(`${API_BASE}/leads/email-tracker/customers`);
  if (!res.ok) throw new Error("Failed to fetch customer email tracker list");
  return res.json();
}

export async function fetchScheduledQueue(): Promise<ScheduledEmailItem[]> {
  const res = await fetch(`${API_BASE}/leads/scheduled-queue`);
  if (!res.ok) throw new Error("Failed to fetch scheduled queue");
  return res.json();
}

export async function cancelScheduledEmail(scheduleId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/scheduled-queue/${scheduleId}`, {
    method: "DELETE"
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
}): Promise<any> {
  const res = await fetch(`${API_BASE}/batch-send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Batch email dispatch failed.");
  }
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/leads/customers`);
  if (!res.ok) throw new Error("Failed to fetch converted customers");
  return res.json();
}

export async function fetchLeadAuditTrail(leadId: number): Promise<AutomationRun[]> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/audit`);
  if (!res.ok) throw new Error("Failed to fetch lead audit trail");
  return res.json();
}
export const fetchAuditTrail = fetchLeadAuditTrail;

export async function fetchLeadMessages(leadId: number): Promise<MessageLog[]> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch lead message history");
  return res.json();
}
export const fetchMessageLogs = fetchLeadMessages;

export async function updateLeadSalesAction(
  leadId: number,
  status: string,
  reason?: string,
  assignedTo?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reason, assigned_to: assignedTo })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update lead status");
  }
  return res.json();
}

// Tasks API calls
export async function fetchTasks(): Promise<Task[]> {
  return [];
}

export async function completeTask(_taskId: number): Promise<any> {
  return { success: true };
}

// Lead Intake Simulation API
export async function simulateInboundLead(data: {
  name: string;
  phone: string;
  email: string;
  source: string;
  budget?: number;
  intent_signals?: string[];
  company_size?: string;
  notes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/intake/webform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to intake lead");
  }
  return res.json();
}
export const createIntakeLead = simulateInboundLead;

export async function triggerInboundReply(phoneOrEmail: string, content: string, channel: string = "email"): Promise<any> {
  const res = await fetch(`${API_BASE}/intake/inbound-reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_or_email: phoneOrEmail, content, channel })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to trigger inbound reply");
  }
  return res.json();
}

// Settings API calls
export async function fetchEmailSettings(): Promise<EmailSettings> {
  const res = await fetch(`${API_BASE}/settings/email`);
  if (!res.ok) throw new Error("Failed to fetch email settings.");
  return res.json();
}

export async function updateEmailSettings(data: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_tls: boolean;
  email_from: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/settings/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save email settings.");
  }
  return res.json();
}

export async function sendTestEmail(toEmail: string): Promise<any> {
  const res = await fetch(`${API_BASE}/settings/email/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to_email: toEmail })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Test email delivery failed.");
  }
  return res.json();
}
