import { S, FONT_BODY, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function Header({ view, setView, balance, notificationCount = 0, onAddTx, user, disabled }) {
  const NAV = [
    { id: "dashboard", label: "Özet", icon: "▦" },
    { id: "notifications", label: "Bildirimler", icon: "!" },
    { id: "transactions", label: "İşlemler", icon: "⇄" },
    { id: "subscriptions", label: "Abonelikler", icon: "↻" },
    { id: "reports", label: "Raporlar", icon: "▥" },
    { id: "goals", label: "Hedefler", icon: "◎" },
    { id: "coach", label: "AI Koç", icon: "✦" },
    { id: "categories", label: "Kategoriler", icon: "▤" },
    { id: "account", label: "Hesap", icon: "◉" },
  ]

  return (
    <header className="luminous-sidebar">
      <div
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
      </div>

      <div
        className="glass-card"
        style={{
          marginTop: 28,
          padding: "0.8rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: balance >= 0 ? S.green : S.red,
            boxShadow: `0 0 18px ${balance >= 0 ? S.green : S.red}`,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            className="finance-number"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: balance >= 0 ? S.green : S.red,
              whiteSpace: "nowrap",
            }}
          >
            {balance >= 0 ? "+" : ""}
            {TRY(balance)}
          </div>
          <div style={{ fontSize: 11, color: S.muted, marginTop: 3 }}>Net bakiye</div>
        </div>
      </div>

      <nav className="luminous-nav">
        {NAV.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`luminous-nav-button${view === t.id ? " is-active" : ""}`}
          >
            <span
              aria-hidden="true"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "grid",
                placeItems: "center",
                background: view === t.id ? "rgba(78,222,163,0.16)" : "rgba(255,255,255,0.04)",
                color: view === t.id ? S.green : S.muted,
                flexShrink: 0,
              }}
            >
              {t.icon}
            </span>
            {t.label}
            {t.id === "notifications" && notificationCount > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  minWidth: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  color: "#2b1900",
                  background: S.amber,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "grid",
          gap: 12,
        }}
      >
        {user?.email && (
          <div
            style={{
              color: S.sub,
              fontSize: 13,
              borderTop: `1px solid ${S.border}`,
              paddingTop: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={user.email}
          >
            {user.email}
          </div>
        )}
        <button
          onClick={onAddTx}
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
  )
}
