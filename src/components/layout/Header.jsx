import { useState } from "react"
import { S, FONT_BODY, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function Header({ view, setView, balance, notificationCount = 0, onAddTx, user, disabled, theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || "Hesabım"
  const initials = displayName
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const NAV = [
    { id: "dashboard",     label: "Özet",        icon: "dashboard",     group: "Genel" },
    { id: "transactions",  label: "İşlemler",    icon: "transactions",  group: "Genel" },
    { id: "receipts",      label: "Belgeler",    icon: "receipts",      group: "Analiz" },
    { id: "reports",       label: "Raporlar",    icon: "reports",       group: "Analiz" },
    { id: "coach",         label: "AI Koç",      icon: "coach",         group: "Analiz" },
    { id: "calendar",      label: "Takvim",      icon: "calendar",      group: "Yönetim" },
    { id: "goals",         label: "Hedefler",    icon: "goals",         group: "Yönetim" },
    { id: "debts",         label: "Borçlar",     icon: "debts",         group: "Yönetim" },
    { id: "subscriptions", label: "Abonelikler", icon: "subscriptions", group: "Yönetim" },
    { id: "categories",    label: "Kategoriler", icon: "categories",    group: "Yönetim" },
    { id: "currency",      label: "Döviz",       icon: "currency",      group: "Yönetim" },
  ]

  const navigate = (nextView) => {
    setView(nextView)
    setMobileOpen(false)
  }

  const addTransaction = () => {
    onAddTx()
    setMobileOpen(false)
  }

  return (
    <>
    <button
      className="mobile-sidebar-trigger"
      type="button"
      onClick={() => setMobileOpen(true)}
      aria-label="Menüyü aç"
      aria-expanded={mobileOpen}
    >
      <span className="mobile-sidebar-mark">BF</span>
      <span>
        <strong>BudgetFlow</strong>
        <small>PREMIUM FİNANS</small>
      </span>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>

    {mobileOpen && (
      <button
        className="mobile-sidebar-scrim"
        type="button"
        onClick={() => setMobileOpen(false)}
        aria-label="Menüyü kapat"
      />
    )}

    <header className={`luminous-sidebar${mobileOpen ? " is-mobile-open" : ""}`}>
      <div
        className="sidebar-brand-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `linear-gradient(135deg,${S.green},${S.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 900,
            color: "#002113",
            boxShadow: "0 0 32px rgba(78,222,163,0.28), inset 0 1px 0 rgba(255,255,255,0.38)",
          }}
        >
          BF
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0, fontFamily: FONT_BODY }}>
            BudgetFlow
          </div>
          <div style={{ color: S.green, fontSize: 12, letterSpacing: 0, marginTop: 4 }}>
            PREMIUM FİNANS
          </div>
        </div>
        <button
          className="mobile-sidebar-close"
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Menüyü kapat"
        >
          ×
        </button>
      </div>

      <div
        className="glass-card sidebar-balance-card"
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderLeft: `3px solid ${balance >= 0 ? S.green : S.red}`,
          borderRadius: "0 8px 8px 0",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: balance >= 0 ? S.green : S.red,
            boxShadow: `0 0 14px ${balance >= 0 ? S.green : S.red}`,
            flexShrink: 0,
          }}
        />
        <div className="sidebar-balance-copy" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: S.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
            Net Bakiye
          </div>
          <div
            className="finance-number sidebar-balance-value"
            style={{ fontWeight: 800, color: balance >= 0 ? S.green : S.red, whiteSpace: "nowrap" }}
          >
            {balance >= 0 ? "+" : ""}
            {TRY(balance)}
          </div>
        </div>
      </div>

      <nav className="luminous-nav" style={{ marginTop: "1.5rem" }}>
        {NAV.map((t, i) => {
          const showGroupLabel = i === 0 || NAV[i - 1].group !== t.group
          return (
            <div key={t.id}>
              {showGroupLabel && (
                <span className="nav-group-label">{t.group}</span>
              )}
              <button
                onClick={() => navigate(t.id)}
                className={`luminous-nav-button${view === t.id ? " is-active" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="luminous-nav-icon"
                  style={{ color: view === t.id ? S.green : S.muted }}
                >
                  <NavIcon name={t.icon} />
                </span>
                {t.label}
              </button>
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          {user?.email && (
            <button className="sidebar-profile" onClick={() => navigate("account")} title={user.email} type="button">
              <span className="sidebar-profile-avatar">{initials || "BF"}</span>
              <span className="sidebar-profile-copy">
                <span>{displayName}</span>
                <small>Profil</small>
              </span>
            </button>
          )}
          <button
            className="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
            title={theme === "dark" ? "Aydınlık mod" : "Karanlık mod"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={`sidebar-notification-button${view === "notifications" ? " is-active" : ""}`}
            onClick={() => navigate("notifications")}
            type="button"
            aria-label={`Bildirimler${notificationCount > 0 ? `, ${notificationCount} yeni` : ""}`}
            title="Bildirimler"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.27 21a2 2 0 0 0 3.46 0" />
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            </svg>
            {notificationCount > 0 && <span>{notificationCount}</span>}
          </button>
        </div>
        <button
          onClick={addTransaction}
          disabled={disabled}
          style={{
            ...btnPrimary,
            width: "100%",
            opacity: disabled ? 0.55 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          + İşlem Ekle
        </button>
      </div>
    </header>
    </>
  )
}

function NavIcon({ name }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }

  const paths = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
        <path d="M14 15h6M14 19h4" />
      </>
    ),
    transactions: (
      <>
        <path d="M7 7h12M15 3l4 4-4 4" />
        <path d="M17 17H5M9 13l-4 4 4 4" />
      </>
    ),
    receipts: (
      <>
        <path d="M7 3.5h10l2 2v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2V3.5Z" />
        <path d="M9 8h6M9 12h7M9 16h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.4" />
        <path d="M8 3.5v4M16 3.5v4M4 10h16" />
        <rect x="8" y="13" width="3" height="3" rx="0.7" />
      </>
    ),
    subscriptions: (
      <>
        <path d="M17.8 7.4A7 7 0 0 0 5 11.3" />
        <path d="M15.4 7.6h2.8V4.8" />
        <path d="M6.2 16.6A7 7 0 0 0 19 12.7" />
        <path d="M8.6 16.4H5.8v2.8" />
        <path d="M12 9v4l2.5 1.5" />
      </>
    ),
    reports: (
      <>
        <path d="M5 19.5V4.5h14v15H5Z" />
        <path d="M8.5 16v-4M12 16V8M15.5 16v-6" />
      </>
    ),
    goals: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.8" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    coach: (
      <>
        <path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8-1.8 4.7-1.8-4.7L5.5 10l4.7-1.8L12 3.5Z" />
        <path d="M18 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
      </>
    ),
    categories: (
      <>
        <path d="M5 6.5h14M5 12h14M5 17.5h14" />
        <path d="M8 4.5v4M15.5 10v4M10.5 15.5v4" />
      </>
    ),
    debts: (
      <>
        <path d="M17 8.5a5 5 0 1 0-10 0 5 5 0 0 0 10 0Z" />
        <path d="M12 6v5l3 1.5" />
        <path d="M7 15.5l-3 4M17 15.5l3 4" />
        <path d="M7.5 19.5h9" />
      </>
    ),
    currency: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M14.5 9.5a3 3 0 0 0-5 2.2c0 1.7 1.2 2.8 2.5 3.3 1.3.5 2.5 1.6 2.5 3.3a3 3 0 0 1-5 2.2" />
        <path d="M12 7v1.5M12 17.5V19" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {paths[name] || paths.dashboard}
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}
