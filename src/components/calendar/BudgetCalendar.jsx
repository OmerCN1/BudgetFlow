import { useMemo, useState } from "react"

import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import { S, btnGhost, btnPrimary } from "../../constants/theme"
import { TRY, today } from "../../utils/helpers"
import { currentMonthKey, totalsFor, transactionsForMonth } from "../../utils/finance"

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export default function BudgetCalendar({ txs, cats, goals = [], recurringRules = [], setView }) {
  const [month, setMonth] = useState(currentMonthKey())
  const calendarToday = localIsoDate(new Date())
  const monthTxs = useMemo(() => transactionsForMonth(txs, month), [txs, month])
  const events = useMemo(
    () => buildCalendarEvents({ month, txs: monthTxs, cats, goals, recurringRules }),
    [month, monthTxs, cats, goals, recurringRules]
  )
  const days = useMemo(() => buildMonthDays(month), [month])
  const eventsByDate = useMemo(() => groupEvents(events), [events])
  const totals = useMemo(() => totalsFor(events.filter((event) => event.kind !== "goal").map(eventToTransaction)), [events])
  const agenda = events
    .filter((event) => event.date >= calendarToday)
    .sort((a, b) => a.date.localeCompare(b.date) || eventPriority(a) - eventPriority(b))
    .slice(0, 8)

  const shiftMonth = (amount) => {
    const [year, monthNumber] = month.split("-").map(Number)
    const date = new Date(year, monthNumber - 1 + amount, 1)
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
  }

  return (
    <div className="budget-calendar-page">
      <Card>
        <div className="budget-calendar-head">
          <div>
            <FieldLabel>Bütçe Takvimi</FieldLabel>
            <h1>{formatMonth(month)}</h1>
          </div>
          <div className="budget-calendar-actions">
            <button onClick={() => shiftMonth(-1)} style={btnGhost} aria-label="Önceki ay">‹</button>
            <button onClick={() => setMonth(currentMonthKey())} style={btnGhost}>Bugün</button>
            <button onClick={() => shiftMonth(1)} style={btnGhost} aria-label="Sonraki ay">›</button>
          </div>
        </div>
        <div className="budget-calendar-stats">
          {[
            { label: "Planlanan Gelir", value: TRY(totals.income), color: S.green },
            { label: "Planlanan Gider", value: TRY(totals.expense), color: S.red },
            { label: "Net Akış", value: TRY(totals.net), color: totals.net >= 0 ? S.green : S.red },
            { label: "Takvim Öğesi", value: events.length, color: S.cyan },
          ].map((item) => (
            <div key={item.label} className="budget-calendar-stat">
              <span>{item.label}</span>
              <strong style={{ color: item.color }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="budget-calendar-layout">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="budget-calendar-weekdays">
            {DAY_NAMES.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="budget-calendar-grid">
            {days.map((day) => {
              const dateEvents = eventsByDate.get(day.date) || []
              const isToday = day.date === calendarToday
              return (
                <div key={day.date} className={`budget-calendar-day${day.inMonth ? "" : " is-muted"}${isToday ? " is-today" : ""}`}>
                  <div className="budget-calendar-day-number">{day.label}</div>
                  <div className="budget-calendar-event-list">
                    {dateEvents.slice(0, 4).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`budget-calendar-event is-${event.tone}`}
                        onClick={() => setView(event.targetView)}
                        title={`${event.title} ${TRY(event.amount || 0)}`}
                      >
                        <span>{event.title}</span>
                        {event.amount > 0 && <b>{event.type === "income" ? "+" : "-"}{compactMoney(event.amount)}</b>}
                      </button>
                    ))}
                    {dateEvents.length > 4 && <small>+{dateEvents.length - 4} kayıt</small>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <FieldLabel>Yaklaşan Akış</FieldLabel>
          {agenda.length === 0 ? (
            <EmptyState
              icon="▣"
              title="Yaklaşan kayıt yok"
              text="Bu ay için tekrarlı ödeme, hedef tarihi veya planlı işlem görünmüyor."
              actionLabel="Şablon Ekle"
              onAction={() => setView("transactions")}
              framed={false}
            />
          ) : (
            <div className="budget-calendar-agenda">
              {agenda.map((event) => (
                <button key={event.id} type="button" onClick={() => setView(event.targetView)}>
                  <span style={{ borderColor: event.color, color: event.color }}>{event.date.slice(8, 10)}</span>
                  <strong>{event.title}</strong>
                  <small>{event.subtitle}</small>
                  {event.amount > 0 && (
                    <b style={{ color: event.type === "income" ? S.green : S.red }}>
                      {event.type === "income" ? "+" : "-"}{TRY(event.amount)}
                    </b>
                  )}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setView("transactions")} style={{ ...btnPrimary, width: "100%", marginTop: 12 }}>
            Yeni Plan Ekle
          </button>
        </Card>
      </div>
    </div>
  )
}

function buildCalendarEvents({ month, txs, cats, goals, recurringRules }) {
  const events = []
  const categoryById = new Map(cats.map((cat) => [cat.id, cat]))

  txs.forEach((tx) => {
    const cat = categoryById.get(tx.cat)
    events.push({
      id: `tx-${tx.id}`,
      kind: "transaction",
      date: tx.date,
      title: tx.desc || cat?.name || "İşlem",
      subtitle: cat?.name || "İşlem",
      amount: tx.amount,
      type: tx.type,
      color: tx.type === "income" ? S.green : S.red,
      tone: tx.type === "income" ? "income" : "expense",
      targetView: "transactions",
    })
  })

  recurringRules
    .filter((rule) => rule.isActive)
    .flatMap((rule) => recurringDatesForMonth(rule, month))
    .forEach(({ rule, date }) => {
      events.push({
        id: `recurring-${rule.id}-${date}`,
        kind: "recurring",
        date,
        title: rule.name,
        subtitle: rule.frequency === "weekly" ? "Haftalık şablon" : "Aylık şablon",
        amount: rule.amount,
        type: rule.type,
        color: rule.type === "income" ? S.green : S.amber,
        tone: rule.type === "income" ? "income" : "recurring",
        targetView: "transactions",
      })
    })

  goals
    .filter((goal) => !goal.isArchived)
    .forEach((goal) => {
      const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
      const monthly = monthlyGoalNeed(goal, remaining)
      const planDate = `${month}-01`
      if (monthly > 0) {
        events.push({
          id: `goal-plan-${goal.id}-${month}`,
          kind: "goal",
          date: planDate,
          title: `${goal.name} birikimi`,
          subtitle: "Aylık hedef payı",
          amount: monthly,
          type: "expense",
          color: goal.color || S.cyan,
          tone: "goal",
          targetView: "goals",
        })
      }
      if (goal.targetDate?.startsWith(month)) {
        events.push({
          id: `goal-deadline-${goal.id}`,
          kind: "goal",
          date: goal.targetDate,
          title: `${goal.name} hedef tarihi`,
          subtitle: remaining > 0 ? `${TRY(remaining)} kaldı` : "Hedef hazır",
          amount: remaining,
          type: "expense",
          color: goal.color || S.cyan,
          tone: "goal",
          targetView: "goals",
        })
      }
    })

  return events.sort((a, b) => a.date.localeCompare(b.date) || eventPriority(a) - eventPriority(b))
}

function buildMonthDays(month) {
  const [year, monthNumber] = month.split("-").map(Number)
  const first = new Date(year, monthNumber - 1, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, monthNumber - 1, 1 - startOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const iso = localIsoDate(date)
    return {
      date: iso,
      label: date.getDate(),
      inMonth: iso.startsWith(month),
    }
  })
}

function recurringDatesForMonth(rule, month) {
  const dates = []
  const [year, monthNumber] = month.split("-").map(Number)
  const daysInMonth = new Date(year, monthNumber, 0).getDate()
  const firstDay = `${month}-01`
  const ruleStart = rule.nextDate || firstDay

  if (rule.frequency === "weekly") {
    let date = new Date(ruleStart)
    while (localIsoDate(date) < firstDay) {
      date.setDate(date.getDate() + 7)
    }
    while (localIsoDate(date).slice(0, 7) === month) {
      dates.push({ rule, date: localIsoDate(date) })
      date.setDate(date.getDate() + 7)
    }
    return dates
  }

  const day = Math.min(Number(rule.dayOfMonth || rule.nextDate?.slice(8, 10) || 1), daysInMonth)
  dates.push({ rule, date: `${month}-${String(day).padStart(2, "0")}` })
  return dates
}

function groupEvents(events) {
  const map = new Map()
  events.forEach((event) => {
    const list = map.get(event.date) || []
    list.push(event)
    map.set(event.date, list)
  })
  return map
}

function eventToTransaction(event) {
  return { amount: event.amount || 0, type: event.type }
}

function eventPriority(event) {
  return event.kind === "recurring" ? 0 : event.kind === "goal" ? 1 : 2
}

function monthlyGoalNeed(goal, remaining) {
  if (!goal.targetDate || remaining <= 0) return 0
  const daysLeft = Math.max(Math.ceil((new Date(goal.targetDate) - new Date(today())) / 86400000), 1)
  return Math.ceil(remaining / Math.max(Math.ceil(daysLeft / 30), 1))
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
}

function compactMoney(value) {
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(Math.round(value))
}

function localIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
