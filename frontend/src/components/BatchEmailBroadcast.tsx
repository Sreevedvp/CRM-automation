import React, { useState, useEffect } from "react";
import type { ScheduledEmailItem } from "../api";
import { sendBatchEmailPreset, fetchScheduledQueue, cancelScheduledEmail } from "../api";
import { Send, Zap, Plus, Trash2, CheckCircle2, AlertCircle, FileText, Users, X, Check, Clock, Calendar } from "lucide-react";

interface RecipientInput {
  name: string;
  email: string;
  phone?: string;
}

interface TemplatePreset {
  id: string;
  title: string;
  subject: string;
  content: string;
}

export const BatchEmailBroadcast: React.FC = () => {
  const INITIAL_TEMPLATES: TemplatePreset[] = [
    {
      id: "demo_overview",
      title: "Product Demo & Platform Overview",
      subject: "Welcome to AutomateCRM — Exclusive Platform Demo Request",
      content: `Hi {name},

Thank you for connecting with us! We have prepared a customized platform overview for {email}.

Key Features Included:
• Automated Real Email & State Machine
• Executive Summary Analysis
• Hard Interrupt Protection for Instant Replies

Please reply to this email to book a 1-on-1 walk-through.

Best regards,
AutomateCRM Sales Team`
    },
    {
      id: "enterprise_offer",
      title: "Exclusive Enterprise Special Offer",
      subject: "Special Q3 Enterprise Offer for {name}",
      content: `Hi {name},

We are excited to offer an exclusive enterprise package for your team at {email}.

Special Included Benefits:
- Unlimited Automated Workflow Runs
- Dedicated Account Manager Support

Let us know if you'd like to claim this offer before the end of the week!

Best regards,
Enterprise Team`
    },
    {
      id: "cold_reengagement",
      title: "Cold Lead Re-engagement Outreach",
      subject: "Re-connecting: Upgraded CRM Automation Suite for {name}",
      content: `Hi {name},

We noticed you previously expressed interest in CRM automation. We've just launched major upgrades for {email}!

Would you be open to a quick 5-minute update this week?

Warm regards,
Growth Team`
    }
  ];

  const [templates, setTemplates] = useState<TemplatePreset[]>(INITIAL_TEMPLATES);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset>(INITIAL_TEMPLATES[0]);
  const [subject, setSubject] = useState<string>(INITIAL_TEMPLATES[0].subject);
  const [content, setContent] = useState<string>(INITIAL_TEMPLATES[0].content);

  // Send Mode: Instant vs Scheduled
  const [sendMode, setSendMode] = useState<"instant" | "scheduled">("instant");
  // Schedule Datetime picker state (default to 1 hour in future)
  const [scheduleTime, setScheduleTime] = useState<string>(() => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    return future.toISOString().slice(0, 16);
  });

  // Scheduled Queue
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledEmailItem[]>([]);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { name: "Sreeved", email: "sreevedvp@gmail.com", phone: "+918590894731" },
    { name: "Jonathan Reed", email: "sreevedvp2002@gmail.com", phone: "+14155552671" }
  ]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [broadcasting, setBroadcasting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const loadScheduledQueue = async () => {
    try {
      const queue = await fetchScheduledQueue();
      setScheduledQueue(queue);
    } catch (e) {
      console.error("Failed loading scheduled queue:", e);
    }
  };

  useEffect(() => {
    loadScheduledQueue();
  }, []);

  const handleSelectPreset = (preset: TemplatePreset) => {
    setSelectedPreset(preset);
    setSubject(preset.subject);
    setContent(preset.content);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      alert("At least one template preset must remain.");
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    if (selectedPreset.id === id) {
      handleSelectPreset(updated[0]);
    }
  };

  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle || !newTemplateSubject || !newTemplateContent) {
      alert("Please fill in template title, subject, and body content.");
      return;
    }

    const created: TemplatePreset = {
      id: "custom_" + Date.now(),
      title: newTemplateTitle,
      subject: newTemplateSubject,
      content: newTemplateContent
    };

    const updated = [created, ...templates];
    setTemplates(updated);
    handleSelectPreset(created);
    
    // Reset modal form
    setNewTemplateTitle("");
    setNewTemplateSubject("");
    setNewTemplateContent("");
    setTemplateModalOpen(false);
  };

  const handleAddRecipient = () => {
    if (!newEmail) {
      alert("Please enter a valid recipient email address.");
      return;
    }
    setRecipients([...recipients, { name: newName || newEmail.split("@")[0], email: newEmail }]);
    setNewName("");
    setNewEmail("");
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleCancelScheduledBatch = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this scheduled email broadcast for all recipients?")) {
      return;
    }

    try {
      await cancelScheduledEmail(id);
      loadScheduledQueue();
    } catch (e) {
      alert("Failed to cancel scheduled email broadcast.");
    }
  };

  const handleBroadcast = async () => {
    if (recipients.length === 0) {
      alert("Please add at least one customer recipient.");
      return;
    }

    if (sendMode === "scheduled" && !scheduleTime) {
      alert("Please select a date and time for scheduled delivery.");
      return;
    }

    try {
      setBroadcasting(true);
      setErrMsg(null);
      setResult(null);

      const res = await sendBatchEmailPreset({
        recipients,
        subject,
        content,
        template_name: selectedPreset.id,
        schedule_at: sendMode === "scheduled" ? scheduleTime : undefined
      });

      setResult(res);
      if (sendMode === "scheduled") {
        loadScheduledQueue();
      }
    } catch (err: any) {
      setErrMsg(err.message || "Email dispatch failed");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <Zap color="var(--brand-primary)" /> Instant & Scheduled Email Broadcast
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Dispatch emails immediately or schedule them for automatic background delivery at a specific date and time!
        </p>
      </div>

      {result && (
        <div className="card-container" style={{ padding: 18, borderLeft: "4px solid var(--text-success)", background: "var(--status-converted-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <CheckCircle2 color="var(--text-success)" size={20} />
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-success)", margin: 0 }}>
              {result.mode === "scheduled"
                ? `Successfully Scheduled ${result.total_scheduled} Email(s) for ${new Date(result.scheduled_at).toLocaleString()}`
                : `Broadcast Complete! ${result.sent_successfully} of ${result.total_dispatched} Emails Sent`}
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>
            {result.mode === "scheduled"
              ? "Emails added to the background APScheduler queue. They will be automatically sent via SMTP at the scheduled time."
              : "Emails dispatched simultaneously via SMTP engine. View the Customer Email Delivery Tracker tab for details."}
          </p>
        </div>
      )}

      {errMsg && (
        <div className="card-container" style={{ padding: 16, borderLeft: "4px solid var(--text-danger)", background: "var(--status-hot-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle color="var(--text-danger)" size={20} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-danger)" }}>{errMsg}</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        
        {/* Left Column: Preset Templates & Content Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Preset Selector Buttons */}
          <div className="card-container" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                <FileText size={16} color="var(--brand-primary)" /> Select Email Template Preset
              </h3>

              {/* Add Custom Template Popup Trigger Button */}
              <button
                className="btn-secondary"
                onClick={() => setTemplateModalOpen(true)}
                style={{ padding: "4px 10px", fontSize: "0.75rem", background: "var(--brand-secondary-bg)", color: "var(--on-secondary-container)" }}
              >
                <Plus size={14} /> Add Template
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {templates.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid var(--brand-primary)" : "1px solid var(--border-default)",
                      background: isSelected ? "var(--bg-subtle)" : "var(--bg-surface)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: isSelected ? "var(--brand-primary)" : "var(--text-primary)" }}>
                        {preset.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                        Subject: {preset.subject}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isSelected && <Check size={16} color="var(--brand-primary)" />}
                      <button
                        onClick={(e) => handleDeleteTemplate(preset.id, e)}
                        title="Delete Template"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Trash2 size={14} color="var(--text-danger)" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Subject & Content Form */}
          <div className="card-container" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, display: "block" }}>
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, display: "block" }}>
                Email Body Message (supports {"{name}"} & {"{email}"})
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 10, fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Send Mode Toggle, Multi-Customer Recipient List & Launch Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div className="card-container" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            
            {/* Send Mode Toggle: Instant vs Scheduled */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>
                Dispatch Timing Mode
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className={sendMode === "instant" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setSendMode("instant")}
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem" }}
                >
                  <Zap size={14} /> Send Instantly (Now)
                </button>
                <button
                  className={sendMode === "scheduled" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setSendMode("scheduled")}
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem" }}
                >
                  <Clock size={14} /> Schedule for Later
                </button>
              </div>
            </div>

            {/* Date & Time Picker when Scheduled is selected */}
            {sendMode === "scheduled" && (
              <div style={{ background: "var(--bg-subtle)", padding: 12, borderRadius: 8, border: "1px solid var(--brand-primary)" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} /> Select Delivery Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    borderRadius: 6,
                    padding: 8,
                    fontSize: "0.88rem",
                    color: "var(--text-primary)",
                    fontWeight: 700
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 4, display: "block" }}>
                  Automated background worker will dispatch email via SMTP at this exact time.
                </span>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 10 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                <Users size={16} color="var(--brand-primary)" /> Customers List ({recipients.length})
              </h3>
            </div>

            {/* Quick Add Custom Customer Input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: "35%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 6, fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ flex: 1, background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 6, fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}
              />
              <button className="btn-secondary" onClick={handleAddRecipient} style={{ padding: "6px 10px", fontSize: "0.78rem" }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Recipients List Table */}
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {recipients.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", padding: 20 }}>
                  No recipients added. Add emails above.
                </p>
              ) : (
                recipients.map((rec, idx) => (
                  <div key={idx} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)", padding: "8px 12px", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>{rec.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{rec.email}</div>
                    </div>
                    <button onClick={() => handleRemoveRecipient(idx)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                      <Trash2 size={14} color="var(--text-danger)" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Launch Broadcast Button */}
            <button
              className="btn-primary"
              onClick={handleBroadcast}
              disabled={broadcasting || recipients.length === 0}
              style={{ padding: 12, justifyContent: "center", marginTop: 6 }}
            >
              {sendMode === "scheduled" ? <Clock size={16} /> : <Send size={16} />}
              {broadcasting
                ? "Processing Request..."
                : sendMode === "scheduled"
                ? `Schedule ${recipients.length} Email(s) for Later`
                : `Send ${recipients.length} Email(s) Instantly`}
            </button>

          </div>

        </div>

      </div>

      {/* Scheduled Outbound Email Queue Section */}
      <div className="card-container" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <Clock color="var(--brand-primary)" size={18} /> Pending Scheduled Email Campaigns ({scheduledQueue.length})
          </h3>
          <button className="btn-secondary" onClick={loadScheduledQueue} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
            Refresh Queue
          </button>
        </div>

        {scheduledQueue.length === 0 ? (
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
            No pending scheduled emails in the background queue.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scheduledQueue.map((item) => (
              <div key={item.id} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)", padding: "12px 16px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.88rem" }}>
                    {item.recipient_name} <span style={{ fontWeight: 500, color: "var(--text-secondary)", fontSize: "0.8rem" }}>({item.recipient_email})</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    Subject: <strong>{item.subject}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge badge-warm" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> Scheduled: {new Date(item.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => handleCancelScheduledBatch(item.id)}
                    style={{ padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-danger)" }}
                  >
                    Cancel Broadcast
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Email Template Popup Modal */}
      {templateModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div className="card-container" style={{ width: "100%", maxWidth: 540, padding: 26, background: "var(--bg-surface)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText color="var(--brand-primary)" size={20} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Custom Email Template</h3>
              </div>
              <button onClick={() => setTemplateModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                  Template Preset Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Enterprise Discount Special"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive Q4 Offer for {name}"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                  Email Body Content (supports {"{name}"} & {"{email}"})
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Hi {name},&#10;&#10;We are pleased to share an exclusive update with you at {email}..."
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <button className="btn-primary" type="submit" style={{ justifyContent: "center", padding: 10, marginTop: 4 }}>
                <CheckCircle2 size={16} /> Save & Use Template
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
