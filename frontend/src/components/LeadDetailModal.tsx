import React, { useEffect, useState } from "react";
import type { Lead, AutomationRun, MessageLog } from "../api";
import { fetchAuditTrail, fetchMessageLogs, updateLeadSalesAction } from "../api";
import { X, CheckCircle, XCircle, UserCheck, ArrowLeft } from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  refreshLeads: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, refreshLeads }) => {
  const [auditLogs, setAuditLogs] = useState<AutomationRun[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [notInterestedReason, setNotInterestedReason] = useState("Price too high");
  const [showReasonBox, setShowReasonBox] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const [audit, msgs] = await Promise.all([
          fetchAuditTrail(lead.id),
          fetchMessageLogs(lead.id)
        ]);
        setAuditLogs(audit);
        setMessageLogs(msgs);
      } catch (e) {
        console.error(e);
      }
    };
    loadDetails();
  }, [lead.id]);

  const handleSalesAction = async (status: string, reason?: string) => {
    try {
      await updateLeadSalesAction(lead.id, status, reason);
      refreshLeads();
      onClose();
    } catch (e) {
      alert("Failed to execute sales action");
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
      <div className="card-container" style={{
        width: "100%",
        maxWidth: 820,
        maxHeight: "92vh",
        overflowY: "auto",
        padding: 28,
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
        
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{lead.name}</h2>
                <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                Lead ID #{lead.id} • Source: <strong style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{lead.source}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={24} />
          </button>
        </div>

        {/* Lead Profile Info Card */}
        <div className="card-container" style={{ padding: 18, background: "var(--bg-subtle)" }}>
          <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12, fontWeight: 700 }}>
            Lead Contact Info
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.88rem" }}>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>Email Address:</span>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{lead.email}</div>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>Phone Number:</span>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{lead.phone}</div>
            </div>
          </div>
        </div>

        {/* Sales Action Toolbar */}
        <div className="card-container" style={{ padding: 18 }}>
          <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10, fontWeight: 700 }}>
            Sales Action Controls
          </h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => handleSalesAction("interested")} style={{ background: "var(--text-success)" }}>
              <CheckCircle size={15} /> Mark "Interested" (Schedule Demo)
            </button>
            <button className="btn-primary" onClick={() => handleSalesAction("converted")}>
              <UserCheck size={15} /> Mark "Converted" (Create Customer)
            </button>
            <button className="btn-secondary" onClick={() => setShowReasonBox(!showReasonBox)}>
              <XCircle size={15} color="var(--text-danger)" /> Mark "Not Interested"
            </button>
          </div>

          {showReasonBox && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", background: "var(--bg-subtle)", padding: 10, borderRadius: 8 }}>
              <select
                value={notInterestedReason}
                onChange={(e) => setNotInterestedReason(e.target.value)}
                style={{ background: "var(--bg-surface)", color: "var(--text-primary)", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-default)" }}
              >
                <option value="Price too high">Price too high</option>
                <option value="Competitor chosen">Competitor chosen</option>
                <option value="Timing not right">Timing not right</option>
                <option value="No response">No response</option>
              </select>
              <button className="btn-primary" onClick={() => handleSalesAction("not_interested", notInterestedReason)} style={{ padding: "6px 12px", fontSize: "0.78rem", background: "var(--text-danger)" }}>
                Move to Nurture
              </button>
            </div>
          )}
        </div>

        {/* Communication Logs & Audit */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          
          <div className="card-container" style={{ padding: 16 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              Outbound Email Messages ({messageLogs.length})
            </h4>
            <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {messageLogs.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>No messages logged yet.</p>
              ) : (
                messageLogs.map((m) => (
                  <div key={m.id} style={{ background: "var(--bg-subtle)", padding: 8, borderRadius: 6, fontSize: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.68rem", fontWeight: 600 }}>
                      <span>{m.direction.toUpperCase()} ({m.channel})</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ margin: "2px 0 0 0", color: "var(--text-primary)", fontWeight: 500 }}>{m.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card-container" style={{ padding: 16 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              Audit Runs ({auditLogs.length})
            </h4>
            <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {auditLogs.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>No audit runs recorded.</p>
              ) : (
                auditLogs.map((a) => (
                  <div key={a.id} style={{ background: "var(--bg-subtle)", padding: 8, borderRadius: 6, fontSize: "0.75rem", borderLeft: "3px solid var(--text-success)" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-success)", fontSize: "0.7rem" }}>{a.trigger}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{a.actions_executed.join(", ")}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
