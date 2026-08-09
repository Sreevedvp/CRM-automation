import React, { useEffect, useState } from "react";
import { fetchEmailSettings, updateEmailSettings, sendTestEmail } from "../api";
import { Mail, Send, X, CheckCircle2 } from "lucide-react";

interface EmailSetupModalProps {
  onClose: () => void;
}

export const EmailSetupModal: React.FC<EmailSetupModalProps> = ({ onClose }) => {
  const [smtpHost] = useState("smtp.gmail.com");
  const [smtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpTls, setSmtpTls] = useState(true);

  // Test Email State
  const [testRecipient, setTestRecipient] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const config = await fetchEmailSettings();
        setSmtpUser(config.smtp_user || "");
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrMsg(null);
      setMsg(null);
      await updateEmailSettings({
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_tls: smtpTls,
        email_from: smtpUser
      });
      setMsg("✅ SMTP credentials saved successfully!");
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient) {
      alert("Please enter a recipient email address to send the test email to.");
      return;
    }
    try {
      setTesting(true);
      setErrMsg(null);
      setMsg(null);
      const res = await sendTestEmail(testRecipient);
      setMsg(`🎉 ${res.message}`);
    } catch (err: any) {
      setErrMsg(err.message || "Test email delivery failed.");
    } finally {
      setTesting(false);
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
      <div className="card-container" style={{ width: "100%", maxWidth: 500, padding: 28, background: "var(--bg-surface)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mail color="var(--brand-primary)" size={22} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Real Email Delivery Setup</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>Configure SMTP credentials to send real emails to leads.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {msg && (
          <div style={{ background: "var(--status-converted-bg)", color: "var(--text-success)", border: "1px solid var(--status-converted-border)", padding: 10, borderRadius: 6, fontSize: "0.82rem", marginBottom: 14, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {errMsg && (
          <div style={{ background: "var(--status-hot-bg)", color: "var(--text-danger)", border: "1px solid var(--status-hot-border)", padding: 10, borderRadius: 6, fontSize: "0.82rem", marginBottom: 14, fontWeight: 600 }}>
            {errMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              SMTP Username (Your Email)
            </label>
            <input
              type="email"
              required
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="your.email@gmail.com"
              style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 10, color: "var(--text-primary)", fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              SMTP Password (or App Password)
            </label>
            <input
              type="password"
              required
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="••••••••••••••••"
              style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 10, color: "var(--text-primary)", fontWeight: 600 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="smtpTlsCheck"
              checked={smtpTls}
              onChange={(e) => setSmtpTls(e.target.checked)}
            />
            <label htmlFor="smtpTlsCheck" style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Enable STARTTLS Encryption
            </label>
          </div>

          <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: 4, justifyContent: "center" }}>
            <CheckCircle2 size={16} /> {saving ? "Saving..." : "Save Email Credentials"}
          </button>
        </form>

        {/* Test Email Section */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 10 }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Send Real Test Email</h4>
          
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="email"
              placeholder="Enter recipient email address..."
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              style={{ flex: 1, background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}
            />
            <button className="btn-secondary" onClick={handleSendTest} disabled={testing} style={{ background: "var(--brand-secondary-bg)", color: "var(--on-secondary-container)" }}>
              <Send size={14} /> {testing ? "Sending..." : "Send Test Email"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
