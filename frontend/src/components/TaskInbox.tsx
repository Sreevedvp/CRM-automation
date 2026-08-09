import React, { useEffect, useState } from "react";
import type { Task } from "../api";
import { fetchTasks, completeTask } from "../api";
import { CheckCircle2, Calendar, User, CheckSquare } from "lucide-react";

export const TaskInbox: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleComplete = async (taskId: number) => {
    try {
      await completeTask(taskId);
      loadTasks();
    } catch (e) {
      alert("Failed to complete task");
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <CheckSquare color="var(--brand-primary)" /> Sales Rep Task Inbox
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Auto-created tasks for HOT leads, follow-ups, and demo site visits.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="card-container" style={{ padding: "8px 16px", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Pending</span>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-danger)", margin: 0 }}>{pendingTasks.length}</p>
          </div>
          <div className="card-container" style={{ padding: "8px 16px", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Completed</span>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-success)", margin: 0 }}>{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading tasks...</div>
      ) : pendingTasks.length === 0 ? (
        <div className="card-container" style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontWeight: 600 }}>
          🎉 All tasks completed! No pending follow-ups.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="card-container"
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: task.title.includes("HOT") ? "4px solid var(--text-danger)" : "4px solid var(--brand-primary)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={task.title.includes("HOT") ? "badge badge-hot" : "badge badge-cold"}>
                    {task.type.replace("_", " ")}
                  </span>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{task.title}</h3>
                </div>
                {task.notes && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>{task.notes}</p>}
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4, fontWeight: 600 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={13} /> Due: {new Date(task.due_date).toLocaleString()}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={13} /> Assigned: {task.assigned_to || "Unassigned"}
                  </span>
                </div>
              </div>

              <button className="btn-primary" onClick={() => handleComplete(task.id)} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                <CheckCircle2 size={16} /> Complete Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
