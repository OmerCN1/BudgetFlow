import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, btnGhost } from "../../constants/theme"
import { buildNotifications } from "../../utils/notifications"

export default function Notifications({
  txs,
  cats,
  goals,
  recurringRules,
  storedNotifications = [],
  onMarkRead,
  setView,
}) {
  const budgetItems = buildNotifications({ txs, cats, goals, recurringRules })
  const storedItems = storedNotifications.map(toStoredNotificationItem)
  const items = [...storedItems, ...budgetItems]
  const unreadCount =
    storedNotifications.filter((item) => !item.isRead).length +
    budgetItems.filter((item) => item.severity !== "info").length

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Merkez</span>
          <h1 className="page-title">Bildirim Merkezi</h1>
          <p className="page-subtitle">Yönetici duyuruları, bütçe riskleri, yaklaşan abonelikler ve hedef ilerlemeleri burada toplanır.</p>
        </div>
        <div className="page-header-actions">
          <span className="notification-count-badge">{unreadCount} okunmamış / kritik</span>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="✓"
          title="Şimdilik bildirim yok"
          text="Bütçeniz sakin görünüyor. Yeni işlem ve abonelikler eklendikçe önemli uyarılar burada görünür."
          actionLabel="İşlem Ekle"
          onAction={() => setView("transactions")}
        />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <Card key={item.id} className="notification-card-v2" style={{ borderColor: `${toneColor(item.severity)}55`, borderLeft: `3px solid ${toneColor(item.severity)}` }}>
              <div className="notifications-item-grid" style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    display: "grid",
                    placeItems: "center",
                    color: toneColor(item.severity),
                    background: `${toneColor(item.severity)}14`,
                    fontWeight: 900,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ color: S.text, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: S.sub, fontSize: 13, marginTop: 4 }}>{item.body}</div>
                </div>
                {item.isStored && !item.isRead && onMarkRead ? (
                  <button onClick={() => onMarkRead(item.notificationId)} style={{ ...btnGhost, padding: "7px 10px", fontSize: 11 }}>
                    Okundu
                  </button>
                ) : item.value && (
                  <div className="finance-number" style={{ color: toneColor(item.severity), fontFamily: FONT_MONO, fontWeight: 800 }}>
                    {item.value}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <FieldLabel>Hızlı Aksiyonlar</FieldLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setView("transactions")} style={btnGhost}>İşlemleri İncele</button>
          <button onClick={() => setView("subscriptions")} style={btnGhost}>Abonelikleri Aç</button>
          <button onClick={() => setView("goals")} style={btnGhost}>Hedeflere Git</button>
        </div>
      </Card>
    </div>
  )
}

function toStoredNotificationItem(notification) {
  return {
    id: `stored-${notification.id}`,
    notificationId: notification.id,
    isStored: true,
    isRead: notification.isRead,
    severity: storedSeverity(notification.type),
    icon: notification.isRead ? "✓" : "•",
    title: notification.title,
    body: notification.message,
    value: formatNotificationDate(notification.createdAt),
  }
}

function toneColor(severity) {
  if (severity === "danger") return S.red
  if (severity === "warning") return S.amber
  if (severity === "success") return S.green
  return S.cyan
}

function storedSeverity(type) {
  if (type === "alert") return "warning"
  if (type === "broadcast") return "info"
  return "success"
}

function formatNotificationDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  })
}
