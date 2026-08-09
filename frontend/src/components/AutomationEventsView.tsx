import React, { useEffect, useState } from "react";
import type { AutomationRun } from "../api";
import { Zap, CheckCircle2, RefreshCw } from "lucide-react";

export const AutomationEventsView: React.FC = () => {
  const [events, setEvents] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/leads");
      const leads = await res.json();
      
      let allLogs: AutomationRun[] = [];
      for (const lead of leads.slice(0, 10)) {
        const auditRes = await fetch(`http://localhost:8000/api/leads/${lead.id}/audit`);
        if (auditRes.ok) {
          const logs = await auditRes.json();
          allLogs = allLogs.concat(logs);
        }
      }
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(allLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Automation Audit Trail & Logs
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Full system audit trail recording every state transition and side-effect dispatch.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadEvents}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Logs
        </button>
      </div>

      {/* Main Audit Table */}
      <div className="card-container" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Execution Event Stream</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Total Recorded: {events.length}</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
              <th style={{ padding: "14px 18px" }}>Trigger</th>
              <th style={{ padding: "14px 18px" }}>Lead ID</th>
              <th style={{ padding: "14px 18px" }}>Executed Actions</th>
              <th style={{ padding: "14px 18px" }}>Timestamp</th>
              <th style={{ padding: "14px 18px", textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                  Loading automation event logs...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                  No execution logs recorded yet. Use the Lead Simulator to fire events.
                </td>
              </tr>
            ) : (
              events.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ background: "var(--bg-subtle)", padding: 6, borderRadius: 6, color: "var(--brand-primary)" }}>
                        <Zap size={14} />
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{log.trigger}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className="badge badge-cold">Lead #{log.lead_id}</span>
                  </td>
                  <td style={{ padding: "14px 18px", maxWidth: 350 }}>
                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 500 }}>
                      {log.actions_executed.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <span className="badge badge-converted">
                      <CheckCircle2 size={12} /> Success
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
