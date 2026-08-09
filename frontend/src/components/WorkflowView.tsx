import React from "react";
import { Zap, CheckCircle, GitBranch, Flame, Sun, Snowflake, ArrowDown, ShieldAlert } from "lucide-react";

export const WorkflowView: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Workflow Canvas Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Visual Automation Workflow Engine
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            State machine layout with atomic side effects and reply interrupt logic.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="badge badge-converted" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
            Status: Active Engine
          </span>
        </div>
      </div>

      {/* Visual Canvas Area with Dot Grid */}
      <div className="card-container dot-grid" style={{ padding: 40, position: "relative", minHeight: 680, overflowX: "auto" }}>
        
        <div style={{ maxWidth: 850, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
          
          {/* Node 1: Trigger */}
          <div className="card-container" style={{ width: 340, borderLeft: "5px solid var(--brand-primary)", background: "var(--bg-surface)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ background: "var(--bg-subtle)", padding: 6, borderRadius: 6, color: "var(--brand-primary)" }}>
                <Zap size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Lead Intake Trigger</h3>
                <span className="font-mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>POST /api/intake</span>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Accepts website forms, WhatsApp inbound, Facebook ads, and manual imports.
            </p>
          </div>

          <ArrowDown color="var(--border-hover)" size={24} />

          {/* Node 2: Validation & Deduplication */}
          <div className="card-container" style={{ width: 340, borderLeft: "5px solid var(--text-success)", background: "var(--bg-surface)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ background: "var(--status-converted-bg)", padding: 6, borderRadius: 6, color: "var(--text-success)" }}>
                <CheckCircle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Validation & Deduplication</h3>
                <span className="font-mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>E.164 Clean & Fuzzy Match</span>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Exact phone & fuzzy name/email match. Merges payload without restarting active sequences.
            </p>
          </div>

          <ArrowDown color="var(--border-hover)" size={24} />

          {/* Node 3: Scoring Branch */}
          <div className="card-container" style={{ width: 380, borderLeft: "5px solid var(--text-warning)", background: "var(--bg-subtle)", padding: 18, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <GitBranch size={20} color="var(--text-warning)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>Lead Scoring & Classification</h3>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              Rule-based scoring (budget, intent signals, source, company size).
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <span className="badge badge-hot">HOT ≥ 70</span>
              <span className="badge badge-warm">WARM 40–69</span>
              <span className="badge badge-cold">COLD &lt; 40</span>
            </div>
          </div>

          {/* Branching Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, width: "100%", marginTop: 10 }}>
            
            {/* HOT Path */}
            <div className="card-container" style={{ borderLeft: "4px solid var(--text-danger)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Flame size={18} color="var(--text-danger)" />
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-danger)" }}>HOT Path</h4>
              </div>
              <ul style={{ paddingLeft: 16, fontSize: "0.78rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 6, fontWeight: 500 }}>
                <li>Round-robin Exec assignment</li>
                <li>WhatsApp template welcome</li>
                <li>Priority Email overview</li>
                <li>Create 4h Call Task</li>
              </ul>
            </div>

            {/* WARM Path */}
            <div className="card-container" style={{ borderLeft: "4px solid var(--text-warning)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Sun size={18} color="var(--text-warning)" />
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-warning)" }}>WARM Path</h4>
              </div>
              <ul style={{ paddingLeft: 16, fontSize: "0.78rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 6, fontWeight: 500 }}>
                <li>Automated Drip (Day 1, 3, 7)</li>
                <li>WhatsApp & Email guide</li>
                <li>Pre-send status check lock</li>
              </ul>
            </div>

            {/* COLD Path */}
            <div className="card-container" style={{ borderLeft: "4px solid var(--brand-primary)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Snowflake size={18} color="var(--brand-primary)" />
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--brand-primary)" }}>COLD Path</h4>
              </div>
              <ul style={{ paddingLeft: 16, fontSize: "0.78rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 6, fontWeight: 500 }}>
                <li>Handoff to Marketing Nurture</li>
                <li>Drip newsletter list</li>
                <li>Re-engagement evaluator</li>
              </ul>
            </div>

          </div>

          {/* Safety Critical Hard Interrupt Banner */}
          <div className="card-container" style={{ width: "100%", background: "var(--status-hot-bg)", border: "1px solid var(--status-hot-border)", padding: 16, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <ShieldAlert color="var(--text-danger)" size={20} />
              <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-danger)" }}>
                Safety-Critical Hard Interrupt (Inbound Reply Rule)
              </h4>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-danger)", lineHeight: 1.4, fontWeight: 600 }}>
              ANY inbound customer reply (WhatsApp or Email) triggers an immediate atomic interrupt: cancels all queued sequence steps, sets status to <strong>'replied'</strong>, evaluates AI intent/sentiment, and alerts the assigned sales executive.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
