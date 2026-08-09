import React, { useState } from "react";
import { createIntakeLead, triggerInboundReply } from "../api";
import { X, Send, Zap, MessageSquare, Sparkles } from "lucide-react";

interface LeadSimulatorModalProps {
  onClose: () => void;
  refreshLeads: () => void;
}

export const LeadSimulatorModal: React.FC<LeadSimulatorModalProps> = ({ onClose, refreshLeads }) => {
  const [activeMode, setActiveMode] = useState<"intake" | "reply">("intake");
  
  // Intake Form State
  const [name, setName] = useState("Jonathan Reed");
  const [phone, setPhone] = useState("+1415555" + Math.floor(1000 + Math.random() * 9000));
  const [email, setEmail] = useState("jonathan.r@acme.org");
  const [source, setSource] = useState("website");
  const [budget, setBudget] = useState(85000);
  const [companySize, setCompanySize] = useState("500+ employees");
  const [notes, setNotes] = useState("Interested in enterprise sales automation for 100 reps.");
  const [submitting, setSubmitting] = useState(false);

  // Inbound Reply State
  const [replyTarget, setReplyTarget] = useState("jonathan.r@acme.org");
  const [channel, setChannel] = useState("email"); // Default to Email
  const [replyMessage, setReplyMessage] = useState("Hi! Can we schedule a demo call tomorrow morning?");
  const [replying, setReplying] = useState(false);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createIntakeLead({
        name,
        phone,
        email,
        source,
        budget: Number(budget),
        intent_signals: ["demo", "pricing", "enterprise"],
        company_size: companySize,
        notes
      });
      refreshLeads();
      onClose();
    } catch (e: any) {
      alert("Intake simulation failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReplying(true);
      const res = await triggerInboundReply(replyTarget, channel, replyMessage);
      alert(`Hard Interrupt Success! Lead ID #${res.lead_id} status updated to 'replied'. AI Intent: ${res.ai_intent}`);
      refreshLeads();
      onClose();
    } catch (e: any) {
      alert("Inbound reply simulation failed: " + e.message);
    } finally {
      setReplying(false);
    }
  };

  return (
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
      <div className="card-container" style={{ width: "100%", maxWidth: 620, padding: 24, background: "var(--bg-surface)" }}>
        
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles color="var(--brand-primary)" size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Interactive Lead Simulator</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            className={activeMode === "intake" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveMode("intake")}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <Zap size={16} /> Simulate New Intake
          </button>
          <button
            className={activeMode === "reply" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveMode("reply")}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <MessageSquare size={16} /> Inbound Reply (Hard Interrupt)
          </button>
        </div>

        {activeMode === "intake" ? (
          <form onSubmit={handleCreateLead} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Phone (E.164)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Source Channel</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                >
                  <option value="website">Website Form</option>
                  {/* <option value="whatsapp">WhatsApp Direct</option> */}
                  <option value="google_ads">Google Ads</option>
                  <option value="facebook_ads">Facebook Ads</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Budget ($ USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Company Size</label>
                <input
                  type="text"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Inquiry Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600, resize: "none" }}
              />
            </div>

            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8, justifyContent: "center" }}>
              <Send size={16} /> {submitting ? "Processing Engine..." : "Submit Simulated Lead"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendReply} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Target Lead Email or Phone</label>
              <input
                type="text"
                required
                value={replyTarget}
                onChange={(e) => setReplyTarget(e.target.value)}
                placeholder="email@example.com or +14155550199"
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Inbound Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
              >
                <option value="email">Email Inbound</option>
                {/* <option value="whatsapp">WhatsApp Business API Inbound</option> */}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Customer Message Text</label>
              <textarea
                rows={3}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600, resize: "none" }}
              />
            </div>

            <div style={{ background: "var(--status-hot-bg)", border: "1px solid var(--status-hot-border)", padding: 10, borderRadius: 6, fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: 600 }}>
              ⚡ Inbound reply triggers an atomic hard interrupt: cancels all scheduled automated drip emails for this lead and runs AI intent analysis!
            </div>

            <button className="btn-primary" type="submit" disabled={replying} style={{ justifyContent: "center" }}>
              <Send size={16} /> {replying ? "Executing Interrupt..." : "Fire Inbound Reply Webhook"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
