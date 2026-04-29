import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, btnGhost } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import { currentMonthKey, transactionsForMonth, totalsFor } from "../../utils/finance"

export default function Notifications({ txs, cats, goals, recurringRules, setView }) {
  const items = buildNotifications({ txs, cats, goals, recurringRules })
  const unreadCount = items.filter((item) => item.severity !== "info").length

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Merkez</span>
          <h1 className="page-title">Bildirim Merkezi</h1>
          <p className="page-subtitle">Bütçe riskleri, yaklaşan abonelikler ve hedef ilerlemeleri burada toplanır.</p>
        </div>
        <div className="page-header-actions">
          <span className="notification-count-badge">{unreadCount} kritik uyarı</span>
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
              <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 14, alignItems: "center" }}>
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
                {item.value && (
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

export function buildNotifications({ txs, cats, goals, recurringRules }) {
  const monthTxs = transactionsForMonth(txs, currentMonthKey())
  const totals = totalsFor(monthTxs)
  const items = []

  if (totals.net < 0) {
    items.push({
      id: "negative-net",
      severity: "danger",
      icon: "!",
      title: "Nakit akışı negatif",
      body: "Bu ay giderler gelirleri aşıyor. Değişken harcamaları kontrol etmek iyi olur.",
      value: TRY(totals.net),
    })
  }

  cats
    .filter((cat) => !cat.isIncome && !cat.isArchived && cat.budget > 0)
    .forEach((cat) => {
      const spent = monthTxs
        .filter((tx) => tx.type === "expense" && tx.cat === cat.id)
        .reduce((total, tx) => total + tx.amount, 0)
      const pct = (spent / cat.budget) * 100
      if (pct >= 80) {
        items.push({
          id: `budget-${cat.id}`,
          severity: pct >= 100 ? "danger" : "warning",
          icon: "△",
          title: `${cat.name} bütçesi ${pct >= 100 ? "aşıldı" : "yaklaştı"}`,
          body: `${TRY(spent)} / ${TRY(cat.budget)} kullanıldı.`,
          value: `%${Math.round(pct)}`,
        })
      }
    })

  recurringRules
    .filter((rule) => rule.isActive)
    .forEach((rule) => {
      const days = daysUntil(rule.nextDate)
      if (days >= 0 && days <= 7) {
        items.push({
          id: `recurring-${rule.id}`,
          severity: days <= 2 ? "warning" : "info",
          icon: "↻",
          title: `${rule.name} yaklaşıyor`,
          body: days === 0 ? "Bugün planlandı." : `${days} gün sonra planlandı.`,
          value: `${rule.type === "income" ? "+" : "-"}${TRY(rule.amount)}`,
        })
      }
    })

  goals
    .filter((goal) => !goal.isArchived && goal.targetAmount > 0)
    .forEach((goal) => {
      const pct = (goal.currentAmount / goal.targetAmount) * 100
      if (pct >= 90 && pct < 100) {
        items.push({
          id: `goal-${goal.id}`,
          severity: "success",
          icon: "◎",
          title: `${goal.name} hedefi bitişe yakın`,
          body: "Son katkılarla hedef neredeyse tamamlandı.",
          value: `%${Math.round(pct)}`,
        })
      }
    })

  return items.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, 12)
}

function daysUntil(dateString) {
  const today = new Date()
  const target = new Date(`${dateString}T12:00:00`)
  today.setHours(12, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function severityRank(severity) {
  if (severity === "danger") return 3
  if (severity === "warning") return 2
  if (severity === "success") return 1
  return 0
}

function toneColor(severity) {
  if (severity === "danger") return S.red
  if (severity === "warning") return S.amber
  if (severity === "success") return S.green
  return S.cyan
}
