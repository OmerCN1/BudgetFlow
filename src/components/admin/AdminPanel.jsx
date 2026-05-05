import { useEffect, useState } from "react"
import AdminAuditLog from "./AdminAuditLog"
import AdminBroadcast from "./AdminBroadcast"
import AdminOverview from "./AdminOverview"
import AdminSystemHealth from "./AdminSystemHealth"
import AdminUsers from "./AdminUsers"

const SECTIONS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "users", label: "Kullanıcılar" },
  { id: "broadcast", label: "Bildirim" },
  { id: "health", label: "Sistem" },
  { id: "audit", label: "Audit Log" },
]

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

export default function AdminPanel({ user, isAdmin, loading, setView }) {
  const [section, setSection] = useState("overview")

  useEffect(() => {
    if (!loading && !isAdmin) setView("dashboard")
  }, [isAdmin, loading, setView])

  if (loading || !isAdmin) return null

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 900,
            flexShrink: 0,
          }}>
            <span style={{ color: "#1B3A6B" }}>B</span><span style={{ color: "#22B573" }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#dde4dd", lineHeight: 1 }}>
              Admin Console
            </div>
            <div style={{ fontSize: "0.6rem", color: "#86948a", marginTop: 2 }}>BudgetAssist</div>
          </div>
        </div>

        <nav className="admin-topnav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`admin-topnav-btn${section === s.id ? " is-active" : ""}`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#86948a", fontSize: "0.75rem" }}>
            <ShieldIcon />
            <span>{user?.email}</span>
          </div>
          <button className="admin-exit-btn" onClick={() => setView("dashboard")}>
            <ArrowIcon />
            Uygulamaya Dön
          </button>
        </div>
      </header>

      <main className="admin-main">
        {section === "overview" && <AdminOverview />}
        {section === "users" && <AdminUsers adminId={user?.id} />}
        {section === "broadcast" && <AdminBroadcast adminId={user?.id} />}
        {section === "health" && <AdminSystemHealth />}
        {section === "audit" && <AdminAuditLog />}
      </main>
    </div>
  )
}
