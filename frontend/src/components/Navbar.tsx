import React from "react";
import { Sparkles, Bot, PlusCircle, CheckSquare, Users, UserCheck, BarChart3, Radio } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openSimulator }) => {
  return (
    <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#0f172a", padding: "12px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1400, margin: "0 auto" }}>
        
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            padding: 8,
            borderRadius: 10,
            display: "flex"
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              CRM <span className="gradient-text">Automation Engine</span>
            </h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>State Machine & AI Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: 6, background: "rgba(30, 41, 59, 0.6)", padding: 4, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            className={activeTab === "leads" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveTab("leads")}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <Users size={16} /> Leads Pipeline
          </button>
          <button
            className={activeTab === "tasks" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveTab("tasks")}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <CheckSquare size={16} /> Task Inbox
          </button>
          <button
            className={activeTab === "customers" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveTab("customers")}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <UserCheck size={16} /> Customers
          </button>
          <button
            className={activeTab === "analytics" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveTab("analytics")}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <BarChart3 size={16} /> Funnel Analytics
          </button>
        </nav>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", color: "#34d399" }}>
            <Radio size={12} className="animate-pulse" /> Live Engine (FastAPI)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", color: "#c084fc" }}>
            <Bot size={12} /> AI Engine Active
          </div>

          <button className="btn-primary" onClick={openSimulator} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            <PlusCircle size={16} /> Lead Simulator
          </button>
        </div>

      </div>
    </header>
  );
};
