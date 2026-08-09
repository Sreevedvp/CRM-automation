import React, { useEffect, useState } from "react";
import type { Customer } from "../api";
import { fetchCustomers } from "../api";
import { UserCheck, Phone, Mail } from "lucide-react";

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <UserCheck color="var(--text-success)" /> Converted Customers Directory
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Leads successfully converted into paying customer accounts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading customer database...</div>
      ) : customers.length === 0 ? (
        <div className="card-container" style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontWeight: 600 }}>
          No converted customers yet. Use the Lead Detail view to mark a lead as "Converted".
        </div>
      ) : (
        <div className="card-container" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Customer Name</th>
                <th style={{ padding: "14px 18px" }}>Linked Lead ID</th>
                <th style={{ padding: "14px 18px" }}>Contact Info</th>
                <th style={{ padding: "14px 18px" }}>Notes</th>
                <th style={{ padding: "14px 18px" }}>Converted Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className="badge badge-converted">Lead #{c.linked_lead_id}</span>
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> {c.phone}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} /> {c.email}</div>
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-primary)", fontWeight: 500 }}>{c.notes || "—"}</td>
                  <td style={{ padding: "14px 18px", color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600 }}>
                    {new Date(c.converted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
