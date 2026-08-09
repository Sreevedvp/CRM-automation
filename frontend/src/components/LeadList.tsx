import React from "react";
import type { Lead } from "../api";
import { Flame, Sun, TrendingUp, Activity, Mail, Phone, ChevronRight, CheckCircle2 } from "lucide-react";

interface LeadListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  leads,
  onSelectLead,
  statusFilter,
  setStatusFilter
}) => {
  const hotCount = leads.filter((l) => l.status === "hot").length;
  const warmCount = leads.filter((l) => l.status === "warm").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  const total = leads.length || 1;
  const hotPercent = Math.round((hotCount / total) * 100);
  const warmPercent = Math.round((warmCount / total) * 100);

  const getBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "hot":
        return "badge-hot";
      case "warm":
        return "badge-warm";
      case "cold":
        return "badge-cold";
      case "replied":
        return "badge-replied";
      case "converted":
        return "badge-converted";
      default:
        return "badge-nurture";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        
        {/* Total Leads Card */}
        <div className="card-container" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Leads</span>
            <Activity size={18} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{leads.length}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: "0.8rem", color: "var(--text-success)", fontWeight: 600 }}>
            <TrendingUp size={14} /> <span>12% from last month</span>
          </div>
        </div>

        {/* Hot Leads Card */}
        <div className="card-container" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Hot Leads</span>
            <Flame size={18} color="var(--text-danger)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{hotCount}</div>
          <div style={{ height: 4, width: "100%", background: "var(--bg-subtle)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--text-danger)", width: `${hotPercent || 25}%` }} />
          </div>
        </div>

        {/* Warm Leads Card */}
        <div className="card-container" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Warm Leads</span>
            <Sun size={18} color="var(--text-warning)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{warmCount}</div>
          <div style={{ height: 4, width: "100%", background: "var(--bg-subtle)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--text-warning)", width: `${warmPercent || 40}%` }} />
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="card-container" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Conversion Rate</span>
            <CheckCircle2 size={18} color="var(--text-success)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {((convertedCount / total) * 100).toFixed(1)}%
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: "0.8rem", color: "var(--text-success)", fontWeight: 600 }}>
            <TrendingUp size={14} /> <span>{convertedCount} Closed Customers</span>
          </div>
        </div>

      </div>

      {/* Main Leads Data Directory Table */}
      <div className="card-container" style={{ overflow: "hidden" }}>
        
        {/* Table Filter Tabs Bar */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", gap: 8, flexWrap: "wrap", background: "var(--bg-surface)" }}>
          {["all", "hot", "warm", "cold", "replied", "converted", "nurture"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                fontSize: "0.8rem",
                fontWeight: statusFilter === tab ? 700 : 500,
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                textTransform: "capitalize",
                background: statusFilter === tab ? "var(--brand-primary)" : "var(--bg-subtle)",
                color: statusFilter === tab ? "var(--text-on-primary)" : "var(--text-primary)",
                transition: "all 0.15s ease"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Simplified Table: Name, Status, Contact Info, Action */}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
              <th style={{ padding: "14px 20px" }}>Lead Name</th>
              <th style={{ padding: "14px 20px" }}>Status</th>
              <th style={{ padding: "14px 20px" }}>Contact Info</th>
              <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                  No leads found matching filter criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  style={{
                    borderBottom: "1px solid var(--border-default)",
                    cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>Source: <span style={{ textTransform: "capitalize" }}>{lead.source}</span></div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={`badge ${getBadgeClass(lead.status)}`}>{lead.status}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 500 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={13} color="var(--brand-primary)" /> {lead.email}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}><Phone size={13} /> {lead.phone}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
                      View Details <ChevronRight size={14} />
                    </button>
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
