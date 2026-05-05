import { TRY } from "./helpers"
import { currentMonthKey, transactionsForMonth, totalsFor } from "./finance"

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
