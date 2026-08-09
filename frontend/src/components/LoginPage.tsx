import React, { useState } from "react";
import type { User } from "../api";
import { loginUser } from "../api";
import { Zap, ShieldCheck, Lock, Mail, UserCheck, ArrowRight } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await loginUser(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPw: string) => {
    try {
      setLoading(true);
      setError(null);
      setEmail(demoEmail);
      setPassword(demoPw);
      const user = await loginUser(demoEmail, demoPw);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div className="card-container" style={{
        width: "100%",
        maxWidth: 440,
        padding: 36,
        background: "var(--bg-surface)",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.08)"
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            padding: 12,
            borderRadius: 14,
            color: "#ffffff",
            marginBottom: 12,
            boxShadow: "var(--shadow-btn)"
          }}>
            <Zap size={28} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Automate<span style={{ color: "var(--brand-primary)" }}>CRM</span>
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>
            Sign in to access your Sales & Automation Console
          </p>
        </div>

        {error && (
          <div style={{
            background: "var(--status-hot-bg)",
            border: "1px solid var(--status-hot-border)",
            color: "var(--text-danger)",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: "0.82rem",
            marginBottom: 20,
            fontWeight: 600,
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  width: "100%",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  padding: "10px 12px 10px 38px",
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "block" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  padding: "10px 12px 10px 38px",
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 6 }}>
            {loading ? "Authenticating..." : "Sign In to CRM Console"} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", textAlign: "center", letterSpacing: "0.05em" }}>
            Quick Demo Shortcuts
          </span>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleQuickLogin("admin@company.com", "adminpassword")}
              style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "8px" }}
            >
              <ShieldCheck size={14} color="var(--brand-primary)" /> Admin Role
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleQuickLogin("sarah.chen@company.com", "staffpassword")}
              style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "8px" }}
            >
              <UserCheck size={14} color="var(--text-success)" /> Staff Role
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
