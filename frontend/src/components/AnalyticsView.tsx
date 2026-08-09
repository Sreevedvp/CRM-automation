import React from "react";
import type { Lead } from "../api";
import { BarChart3, TrendingUp, Flame, Sun, Snowflake, MessageSquare, CheckCircle2 } from "lucide-react";

interface AnalyticsViewProps {
  leads: Lead[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads }) => {
  const hotCount = leads.filter((l) => l.status === "hot").length;
  const warmCount = leads.filter((l) => l.status === "warm").length;
  const coldCount = leads.filter((l) => l.status === "cold").length;
  const repliedCount = leads.filter((l) => l.status === "replied").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  const total = leads.length || 1;
  const conversionRate = ((convertedCount / total) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart3 color="var(--brand-primary)" /> Conversion Funnel & Analytics
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Real-time visibility into state transitions from Intake → Routing → Handoff → Conversion.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Total Intake Volume</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>{leads.length}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-success)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <TrendingUp size={12} /> Active Pipeline
          </span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>HOT Leads</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-danger)", margin: "4px 0" }}>{hotCount}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: 600 }}>Score ≥ 70</span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Replied (Interrupted)</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-primary)", margin: "4px 0" }}>{repliedCount}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 600 }}>Automations Paused</span>
        </div>

        <div className="card-container" style={{ padding: 20 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Converted Rate</span>
          <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-success)", margin: "4px 0" }}>{conversionRate}%</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-success)", fontWeight: 600 }}>{convertedCount} Closed Customers</span>
        </div>
      </div>

      {/* Visual Funnel Bar */}
      <div className="card-container" style={{ padding: 24 }}>
        <h3 style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: 800, marginBottom: 16 }}>Lead Lifecycle Funnel Progress</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* HOT */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: 4, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} color="var(--text-danger)" /> HOT Path</span>
              <span>{hotCount} leads ({((hotCount / total) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ background: "var(--bg-subtle)", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(hotCount / total) * 100}%`, height: "100%", background: "var(--text-danger)" }} />
            </div>
          </div>

          {/* WARM */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: 4, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Sun size={14} color="var(--text-warning)" /> WARM Path</span>
              <span>{warmCount} leads ({((warmCount / total) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ background: "var(--bg-subtle)", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(warmCount / total) * 100}%`, height: "100%", background: "var(--text-warning)" }} />
            </div>
          </div>

          {/* COLD */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: 4, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Snowflake size={14} color="var(--brand-primary)" /> COLD Path</span>
              <span>{coldCount} leads ({((coldCount / total) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ background: "var(--bg-subtle)", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(coldCount / total) * 100}%`, height: "100%", background: "var(--brand-primary)" }} />
            </div>
          </div>

          {/* REPLIED */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: 4, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={14} color="var(--brand-primary)" /> Inbound Replied</span>
              <span>{repliedCount} leads ({((repliedCount / total) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ background: "var(--bg-subtle)", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(repliedCount / total) * 100}%`, height: "100%", background: "var(--brand-primary)" }} />
            </div>
          </div>

          {/* CONVERTED */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: 4, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="var(--text-success)" /> Converted</span>
              <span>{convertedCount} customers ({((convertedCount / total) * 100).toFixed(0)}%)</span>
            </div>
            <div style={{ background: "var(--bg-subtle)", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(convertedCount / total) * 100}%`, height: "100%", background: "var(--text-success)" }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
