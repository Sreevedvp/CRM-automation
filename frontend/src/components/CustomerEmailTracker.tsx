import React, { useEffect, useState } from "react";
import type { CustomerEmailRecord } from "../api";
import { fetchCustomerEmailTracker } from "../api";
import { Mail, CheckCircle2, AlertTriangle, Clock, RefreshCw, ChevronDown, ChevronUp, Send, Search } from "lucide-react";

export const CustomerEmailTracker: React.FC = () => {
  const [records, setRecords] = useState<CustomerEmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerEmailTracker();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEmailsSent = records.reduce((acc, curr) => acc + curr.total_emails_sent, 0);
  const successfulCount = records.filter(r => r.last_status === "sent" || r.last_status === "delivered").length;
  const failedCount = records.filter(r => r.last_status === "failed").length;

  const filteredRecords = records.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.last_subject_preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <Mail color="var(--brand-primary)" /> Customer Email Delivery Tracker
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Track email delivery history, brief summaries, and delivery statuses per customer.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadData}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Tracker
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Total Customers Emailed</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>{records.length}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 600 }}>Active Contacts</span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Total Emails Dispatched</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-primary)", margin: "4px 0" }}>{totalEmailsSent}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Outbound Messages</span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Delivered Successfully</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-success)", margin: "4px 0" }}>{successfulCount}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-success)", fontWeight: 600 }}>SMTP Verified</span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Failed / Invalid SMTP</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-danger)", margin: "4px 0" }}>{failedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: 600 }}>Requires Credentials</span>
        </div>
      </div>

      {/* Main Customer Email Directory Table */}
      <div className="card-container" style={{ overflow: "hidden" }}>
        
        {/* Header Bar with Search Input */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Customer Email Delivery Logs</h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Search Input Box */}
            <div style={{ position: "relative", width: 280 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search by customer name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  padding: "8px 12px 8px 36px",
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>

            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>
              Showing {filteredRecords.length} of {records.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            Loading customer email tracking logs...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            {records.length === 0 ? "No emails dispatched yet. Use the Email Simulator or Preset Broadcast tool to send emails." : "No customer records match your search filter."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredRecords.map((rec) => {
              const isExpanded = expandedLeadId === rec.lead_id;
              return (
                <div key={rec.lead_id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  
                  {/* Summary Row */}
                  <div
                    onClick={() => setExpandedLeadId(isExpanded ? null : rec.lead_id)}
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      background: isExpanded ? "var(--bg-subtle)" : "transparent",
                      transition: "background 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        background: rec.last_status === "failed" ? "var(--status-hot-bg)" : "var(--status-converted-bg)",
                        padding: 8,
                        borderRadius: "50%",
                        color: rec.last_status === "failed" ? "var(--text-danger)" : "var(--text-success)"
                      }}>
                        {rec.last_status === "failed" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                          {rec.name} <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>({rec.email})</span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                          <span>Brief: <strong>{rec.last_subject_preview}</strong></span>
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {new Date(rec.last_sent_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ textAlign: "right" }}>
                        <span className={rec.last_status === "failed" ? "badge badge-hot" : "badge badge-converted"}>
                          {rec.total_emails_sent} Email{rec.total_emails_sent === 1 ? "" : "s"} ({rec.last_status.toUpperCase()})
                        </span>
                      </div>

                      {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                    </div>
                  </div>

                  {/* History Timeline Drawer */}
                  {isExpanded && (
                    <div style={{ padding: "16px 20px 20px 56px", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-default)" }}>
                      <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10 }}>
                        Past Outbound Email History Timeline
                      </h4>

                      {rec.history.length === 0 ? (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>No detailed history logged.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {rec.history.map((h) => (
                            <div key={h.id} className="card-container" style={{ padding: 12, background: "var(--bg-surface)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                                  <Send size={12} /> Outbound Message ID #{h.id}
                                </span>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                  <span className={h.status === "failed" ? "badge badge-hot" : "badge badge-converted"}>
                                    {h.status}
                                  </span>
                                  <span>{new Date(h.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                              <pre style={{
                                fontSize: "0.8rem",
                                color: "var(--text-primary)",
                                margin: 0,
                                fontFamily: "inherit",
                                whiteSpace: "pre-wrap",
                                background: "var(--bg-primary)",
                                padding: 10,
                                borderRadius: 6,
                                border: "1px solid var(--border-default)"
                              }}>
                                {h.content}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
