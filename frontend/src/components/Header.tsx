import React from "react";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  openSimulator: () => void;
  openEmailSetup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, openSimulator }) => {
  return (
    <header style={{
      height: 72,
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-default)",
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 30,
      boxShadow: "var(--shadow-sm)"
    }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Real Email Setup Button hidden for now as settings are stored directly in DB */}
        {/* <button className="btn-secondary" onClick={openEmailSetup} style={{ padding: "8px 14px", background: "var(--brand-secondary-bg)", color: "var(--on-secondary-container)" }}>
          <Mail size={16} color="var(--brand-secondary)" /> Real Email Setup
        </button> */}

        <button className="btn-primary" onClick={openSimulator}>
          <Plus size={16} /> New Lead
        </button>
      </div>
    </header>
  );
};
