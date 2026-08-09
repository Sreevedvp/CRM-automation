import React from "react";
import type { User } from "../api";
import { Users, Zap, Plus, LogOut, Mail, Send } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSimulator: () => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openSimulator,
  currentUser,
  onLogout
}) => {
  const navItems = [
    { id: "leads", label: "Lead Overview", icon: Users, roles: ["admin", "staff"] },
    { id: "email_tracker", label: "Customer Email Tracker", icon: Mail, roles: ["admin", "staff"] },
    { id: "batch_broadcast", label: "Preset Email Broadcast", icon: Send, roles: ["admin", "staff"] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside style={{
      width: 256,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 40,
      boxShadow: "var(--shadow-sm)"
    }}>
      {/* Brand Header */}
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "var(--brand-primary)", padding: 7, borderRadius: 8, display: "flex", boxShadow: "var(--shadow-btn)" }}>
            <Zap size={18} color="var(--text-on-primary)" />
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Automate<span style={{ color: "var(--brand-primary)" }}>CRM</span>
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--brand-primary)" : "var(--text-primary)",
                background: isActive ? "var(--bg-subtle)" : "transparent",
                border: isActive ? "1px solid var(--border-focus)" : "1px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={18} color={isActive ? "var(--brand-primary)" : "var(--text-secondary)"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Profile Info & Footer */}
      <div style={{ padding: 16, borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{currentUser.name}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>{currentUser.email}</span>
          </div>
          <span className={currentUser.role === "admin" ? "badge badge-cold" : "badge badge-converted"}>
            {currentUser.role}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-primary"
            onClick={openSimulator}
            style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem", padding: "8px" }}
          >
            <Plus size={14} /> Lead Simulator
          </button>
          
          <button
            className="btn-secondary"
            onClick={onLogout}
            title="Log Out"
            style={{ padding: "8px", border: "1px solid var(--border-default)" }}
          >
            <LogOut size={16} color="var(--text-danger)" />
          </button>
        </div>
      </div>
    </aside>
  );
};
