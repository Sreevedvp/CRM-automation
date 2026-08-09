import { useEffect, useState } from "react";
import type { Lead, User } from "./api";
import { fetchLeads } from "./api";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { LeadList } from "./components/LeadList";
import { CustomerEmailTracker } from "./components/CustomerEmailTracker";
import { BatchEmailBroadcast } from "./components/BatchEmailBroadcast";
import { LoginPage } from "./components/LoginPage";
import { LeadDetailModal } from "./components/LeadDetailModal";
import { LeadSimulatorModal } from "./components/LeadSimulatorModal";
import { EmailSetupModal } from "./components/EmailSetupModal";

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("crm_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [emailSetupOpen, setEmailSetupOpen] = useState<boolean>(false);

  const loadLeads = async () => {
    try {
      const data = await fetchLeads(statusFilter);
      setLeads(data);
    } catch (err) {
      console.error("Error loading leads:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadLeads();
    }
  }, [statusFilter, currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("crm_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("crm_user");
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getPageHeaderDetails = () => {
    switch (activeTab) {
      case "leads":
        return { title: "Lead Overview & Simulator", subtitle: "Monitor CRM performance and trigger single email intake." };
      case "email_tracker":
        return { title: "Customer Email Delivery Tracker", subtitle: "Track emails sent per customer, delivery status, and timeline briefs." };
      case "batch_broadcast":
        return { title: "Preset Email Broadcast Tool", subtitle: "Select pre-designed templates and send emails to multiple customers simultaneously." };
      default:
        return { title: "AutomateCRM", subtitle: "CRM Automation System" };
    }
  };

  const headerInfo = getPageHeaderDetails();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSimulator={() => setSimulatorOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div style={{ flex: 1, marginLeft: 256, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* Header Bar */}
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          openSimulator={() => setSimulatorOpen(true)}
          openEmailSetup={() => setEmailSetupOpen(true)}
        />

        {/* Content View Router */}
        <main style={{ padding: 32, flex: 1 }}>
          {activeTab === "leads" && (
            <LeadList
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}

          {activeTab === "email_tracker" && <CustomerEmailTracker />}

          {activeTab === "batch_broadcast" && <BatchEmailBroadcast />}
        </main>
      </div>

      {/* Modals */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          refreshLeads={loadLeads}
        />
      )}

      {simulatorOpen && (
        <LeadSimulatorModal
          onClose={() => setSimulatorOpen(false)}
          refreshLeads={loadLeads}
        />
      )}

      {emailSetupOpen && (
        <EmailSetupModal
          onClose={() => setEmailSetupOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
