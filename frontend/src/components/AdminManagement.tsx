import React, { useEffect, useState } from "react";
import type { User } from "../api";
import { fetchUsers, createStaffUser } from "../api";
import { ShieldCheck, UserPlus, User as UserIcon, X, CheckCircle2, Shield } from "lucide-react";

export const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createStaffUser(name, email, password, role);
      setModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck color="var(--brand-primary)" /> Admin & Staff Management
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Admin-only controls to add sales staff, manage roles, and enforce RBAC permissions.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Add New Staff Member
        </button>
      </div>

      {/* User Database Table */}
      <div className="card-container" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>Team Members Directory</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>Total Accounts: {users.length}</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
              <th style={{ padding: "14px 18px" }}>Name</th>
              <th style={{ padding: "14px 18px" }}>Email</th>
              <th style={{ padding: "14px 18px" }}>System Role</th>
              <th style={{ padding: "14px 18px" }}>Account Created</th>
              <th style={{ padding: "14px 18px", textAlign: "right" }}>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                  Loading staff accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
                  No accounts found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        background: u.role === "admin" ? "var(--bg-subtle)" : "var(--status-converted-bg)",
                        padding: 6,
                        borderRadius: "50%",
                        color: u.role === "admin" ? "var(--brand-primary)" : "var(--text-success)"
                      }}>
                        {u.role === "admin" ? <Shield size={14} /> : <UserIcon size={14} />}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontWeight: 600 }}>{u.email}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className={u.role === "admin" ? "badge badge-cold" : "badge badge-converted"}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600 }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: u.role === "admin" ? "var(--brand-primary)" : "var(--text-secondary)", fontWeight: 600 }}>
                      {u.role === "admin" ? "Full Access + Add Staff" : "Leads & Tasks Access"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
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
          <div className="card-container" style={{ width: "100%", maxWidth: 480, padding: 28, background: "var(--bg-surface)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid var(--border-default)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserPlus color="var(--brand-primary)" size={20} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Staff Member Account</h3>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ background: "var(--status-hot-bg)", color: "var(--text-danger)", padding: 10, borderRadius: 6, fontSize: "0.8rem", marginBottom: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@company.com"
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Assign System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                  style={{ width: "100%", background: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: 6, padding: 8, color: "var(--text-primary)", fontWeight: 600 }}
                >
                  <option value="staff">Staff (Sales Rep)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>

              <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 10, justifyContent: "center" }}>
                <CheckCircle2 size={16} /> {submitting ? "Creating User..." : "Create Account"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
