import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import ChartTooltip from "../ui/ChartTooltip"
import { S, FONT_BODY, FONT_MONO } from "../../constants/theme"
import { TRY, sum } from "../../utils/helpers"
import { calculateHealthScore, categoryTotals, currentMonthKey, previousMonthKey, totalsFor, transactionsForMonth } from "../../utils/finance"
import { fetchRates, CURRENCY_SYMBOLS } from "../../services/currencyService"

export default function Dashboard({ txs, cats, catById, setView, recurringRules = [] }) {
  const [period, setPeriod] = useState("month")
  const dashboardTxs = useMemo(() => filterTransactionsByPeriod(txs, period), [txs, period])
  const totalIncome  = useMemo(() => sum(dashboardTxs.filter((t) => t.type === "income")),  [dashboardTxs])
  const totalExpense = useMemo(() => sum(dashboardTxs.filter((t) => t.type === "expense")), [dashboardTxs])
  const balance = totalIncome - totalExpense
  const thisMonthTxs = useMemo(() => transactionsForMonth(dashboardTxs, currentMonthKey()), [dashboardTxs])
  const lastMonthTxs = useMemo(() => transactionsForMonth(txs, previousMonthKey()), [txs])
  const thisMonthTotals = useMemo(() => totalsFor(thisMonthTxs), [thisMonthTxs])
  const lastMonthTotals = useMemo(() => totalsFor(lastMonthTxs), [lastMonthTxs])
  const topThisMonthExpense = useMemo(
    () => categoryTotals(thisMonthTxs, cats, "expense")[0],
    [thisMonthTxs, cats]
  )
  const budgetRisks = useMemo(
    () =>
      cats
        .filter((cat) => !cat.isIncome && !cat.isArchived && cat.budget > 0)
        .map((cat) => {
          const spent = thisMonthTxs
            .filter((tx) => tx.type === "expense" && tx.cat === cat.id)
            .reduce((total, tx) => total + tx.amount, 0)
          return { ...cat, spent, pct: (spent / cat.budget) * 100 }
        })
        .filter((cat) => cat.pct >= 80)
        .sort((a, b) => b.pct - a.pct),
    [cats, thisMonthTxs]
  )
  const healthScore = useMemo(
    () => calculateHealthScore({ totals: thisMonthTotals, budgetRisks, cats }),
    [thisMonthTotals, budgetRisks, cats]
  )
  const budgetAlerts = useMemo(() => {
    const alerts = []
    if (thisMonthTotals.net < 0) {
      alerts.push({ tone: S.red, title: "Negatif nakit akışı", body: "Seçili dönemde giderler gelirleri aşıyor." })
    }
    budgetRisks.slice(0, 3).forEach((cat) => {
      alerts.push({
        tone: cat.pct >= 100 ? S.red : S.amber,
        title: `${cat.name} bütçe riski`,
        body: cat.pct >= 100 ? "Limit aşıldı." : `%${Math.round(cat.pct)} kullanıldı.`,
      })
    })
    if (alerts.length === 0) {
      alerts.push({ tone: S.green, title: "Bütçe sakin", body: "Seçili dönem için kritik bir limit uyarısı yok." })
    }
    return alerts
  }, [thisMonthTotals.net, budgetRisks])

  const pieData = useMemo(() => {
    const map = new Map()
    dashboardTxs.filter((t) => t.type === "expense").forEach((t) => {
      const c = catById(t.cat)
      const name = c?.name || "Kategori yok"
      const key = name.trim().toLocaleLowerCase("tr-TR")
      const current = map.get(key) || { name, value: 0, color: c?.color || "#888" }
      map.set(key, { ...current, value: current.value + t.amount })
    })
    const ordered = [...map.values()]
      .sort((a, b) => b.value - a.value)
    const visible = ordered.slice(0, 5)
    const otherValue = ordered.slice(5).reduce((total, item) => total + item.value, 0)
    return otherValue > 0
      ? [...visible, { name: "Diğer", value: otherValue, color: S.muted }]
      : visible
  }, [dashboardTxs, cats])

  const lineData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("tr-TR", { month: "short" })
      return {
        ay:    label,
        Gelir: sum(txs.filter((t) => t.type === "income"  && t.date.startsWith(key))),
        Gider: sum(txs.filter((t) => t.type === "expense" && t.date.startsWith(key))),
      }
    })
  , [txs])

  const monthLabel = new Date().toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  })
  const dashboardStats = [
    {
      label: "Net Bakiye",
      value: balance,
      color: balance >= 0 ? S.green : S.red,
      sign: true,
      caption: `${txs.length} işlem`,
      icon: "balance",
    },
    {
      label: "Toplam Gelir",
      value: totalIncome,
      color: S.cyan,
      caption: `${dashboardTxs.filter((t) => t.type === "income").length} gelir kaydı`,
      icon: "income",
    },
    {
      label: "Toplam Gider",
      value: totalExpense,
      color: S.rose,
      caption: `${dashboardTxs.filter((t) => t.type === "expense").length} gider kaydı`,
      icon: "expense",
    },
    {
      label: "Sağlık Skoru",
      value: healthScore,
      color: healthScore >= 78 ? S.green : healthScore >= 58 ? S.amber : S.red,
      caption: healthScore >= 78 ? "Güçlü finansal ritim" : healthScore >= 58 ? "Yakın takip gerekli" : "Aksiyon zamanı",
      icon: "health",
      raw: true,
    },
  ]

  return (
    <div className="page-root dashboard-page">
      <section className="page-header dashboard-header">
        <div>
          <span className="page-kicker">{monthLabel}</span>
          <h1 className="page-title">Finansal Özet</h1>
          <p className="page-subtitle">Varlık ve harcama durumunuza genel bakış.</p>
        </div>
        <div className="page-header-actions">
          <div className="period-filter-group">
            {[["month", "Bu Ay"], ["quarter", "Son 3 Ay"], ["year", "Yıl"], ["all", "Tümü"]].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`period-filter-btn${period === value ? " is-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setView("transactions")}
            className="dashboard-primary-action"
          >
            İşlem Merkezi →
          </button>
        </div>
      </section>

      <CurrencyTicker setView={setView} />

      <section className="dashboard-metrics-grid">
        {dashboardStats.map((s, i) => (
          <Card
            key={i}
            className={`dashboard-metric-card stagger-item${i === 0 ? " is-primary" : ""}`}
            style={{
              "--metric-color": s.color,
            }}
          >
            <div className="dashboard-metric-top">
              <FieldLabel>{s.label}</FieldLabel>
              <span className="app-icon-box dashboard-metric-icon" style={{ color: s.color }}>
                <DashboardIcon name={s.icon} />
              </span>
            </div>
            <div
              className="finance-number stat-value dashboard-metric-value"
              style={{ color: s.color }}
            >
              {s.raw ? (
                `${s.value}/100`
              ) : (
                <>
                  {s.sign && balance > 0 ? "+" : ""}
                  {TRY(s.value)}
                </>
              )}
            </div>
            <div className="dashboard-metric-caption" style={{ color: i === 0 ? S.green : S.muted }}>
              {s.caption}
            </div>
          </Card>
        ))}
      </section>

      <section className="dashboard-onepage-grid">
        <AISummaryCard
          thisMonthTotals={thisMonthTotals}
          lastMonthTotals={lastMonthTotals}
          topExpenseCat={topThisMonthExpense}
          budgetRisks={budgetRisks}
          setView={setView}
          className="dashboard-ai-card"
        />

        <Card className="dashboard-trend-card dashboard-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Aylık Gelir &amp; Gider Trendi</p>
            <span className="chart-card-meta">Son 6 ay</span>
          </div>
          <ResponsiveContainer width="100%" height={142}>
            <LineChart
              data={lineData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="ay"
                tick={{ fill: S.muted, fontSize: 11, fontFamily: FONT_BODY }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_MONO }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
                width={38}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="Gelir"
                stroke={S.green}
                strokeWidth={3}
                dot={{ r: 4, fill: S.green, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: S.green }}
              />
              <Line
                type="monotone"
                dataKey="Gider"
                stroke={S.red}
                strokeWidth={3}
                dot={{ r: 4, fill: S.red, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: S.red }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
            {[{ c: S.green, l: "Gelir" }, { c: S.red, l: "Gider" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: S.sub }}>
                <div style={{ width: 16, height: 2.5, background: c, borderRadius: 2 }} />
                {l}
              </div>
            ))}
          </div>
        </Card>

        <Card className="dashboard-pie-card dashboard-chart-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-card-header">
            <p className="chart-card-title">Gider Dağılımı</p>
            <span className="chart-card-meta">Kategorilere göre</span>
          </div>
          <ResponsiveContainer width="100%" height={116}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={36}
                outerRadius={54}
                paddingAngle={3}
                stroke="rgba(5,9,13,0.88)"
                strokeWidth={3}
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => TRY(v)}
                contentStyle={{
                  background: "var(--bf-tooltip-bg)",
                  border: "1px solid var(--bf-tooltip-border)",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: FONT_BODY,
                  color: "var(--bf-tooltip-text)",
                  boxShadow: "var(--bf-tooltip-shadow)",
                }}
                labelStyle={{ color: "var(--bf-tooltip-label)", fontWeight: 700 }}
                itemStyle={{ color: "var(--bf-tooltip-text)", fontWeight: 700 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: "auto" }}>
            {pieData.slice(0, 5).map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: S.sub, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.name}
                  </span>
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: S.text }}>
                  {TRY(d.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <MiniCalendar
          txs={thisMonthTxs}
          recurringRules={recurringRules}
          setView={setView}
          className="dashboard-calendar-card"
        />

        <Card className="dashboard-risk-card">
          <div className="dashboard-card-title-row">
            <span className="app-icon-box dashboard-card-icon" style={{ color: S.rose }}>
              <DashboardIcon name="warning" />
            </span>
            <h2 style={{ fontSize: 14, lineHeight: 1.25, fontWeight: 800, color: S.text, letterSpacing: 0 }}>
              Bütçe Riskleri
            </h2>
          </div>
          {budgetRisks.length === 0 ? (
            <div style={{ color: S.green, fontSize: 12 }}>Bu ay kritik bütçe aşımı görünmüyor.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {budgetRisks.slice(0, 2).map((cat) => (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: S.text, fontSize: 12, marginBottom: 5 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                    <span className="finance-number" style={{ flexShrink: 0 }}>{TRY(cat.spent)} / {TRY(cat.budget)}</span>
                  </div>
                  <div style={{ background: "rgba(187,202,191,0.14)", borderRadius: 999, height: 6, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(cat.pct, 100)}%`,
                        height: "100%",
                        background:
                          cat.pct >= 100
                            ? `linear-gradient(90deg, ${S.red}, ${S.rose})`
                            : `linear-gradient(90deg, ${S.green}, ${S.cyan})`,
                        boxShadow: `0 0 14px ${cat.pct >= 100 ? S.red : S.cyan}`,
                      }}
                    />
                  </div>
                  <div style={{ color: cat.pct >= 100 ? S.rose : S.muted, fontSize: 11, textAlign: "right", marginTop: 4 }}>
                    %{Math.round(cat.pct)} kullanıldı
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {budgetAlerts.slice(0, 2).map((alert) => (
              <div key={`${alert.title}-${alert.body}`} style={{ border: `1px solid ${alert.tone}44`, background: `${alert.tone}10`, borderRadius: 8, padding: "7px 8px" }}>
                <div style={{ color: alert.tone, fontWeight: 800, fontSize: 11 }}>{alert.title}</div>
                <div style={{ color: S.sub, fontSize: 10, marginTop: 2 }}>{alert.body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="dashboard-month-card">
          <div className="dashboard-card-title-row">
            <span className="app-icon-box dashboard-card-icon is-filled" style={{ color: "#002113", background: S.green }}>
              <DashboardIcon name="calendar" />
            </span>
            <h2 style={{ fontSize: 14, lineHeight: 1.25, fontWeight: 800, color: S.text, letterSpacing: 0 }}>
              Bu Ay Ne Oldu?
            </h2>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="metric-inset-card">
              <FieldLabel>Net Nakit Akışı</FieldLabel>
              <div className="finance-number" style={{ color: thisMonthTotals.net >= 0 ? S.green : S.red, fontSize: 17, fontWeight: 800 }}>
                {thisMonthTotals.net >= 0 ? "+" : ""}
                {TRY(thisMonthTotals.net)}
              </div>
            </div>
            <div className="metric-inset-card">
              <FieldLabel>En Büyük Gider</FieldLabel>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <span style={{ color: S.text, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {topThisMonthExpense?.name || "Henüz gider yok"}
                </span>
                <span className="finance-number" style={{ color: topThisMonthExpense?.color || S.muted, fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                  {topThisMonthExpense ? TRY(topThisMonthExpense.value) : TRY(0)}
                </span>
              </div>
              <div style={{ color: S.muted, fontSize: 10, marginTop: 5 }}>
                Geçen aya göre{" "}
                <span className="finance-number" style={{ color: thisMonthTotals.expense > lastMonthTotals.expense ? S.red : S.green }}>
                  {TRY(thisMonthTotals.expense - lastMonthTotals.expense)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="dashboard-recent-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p className="chart-card-title" style={{ marginBottom: 0 }}>Son İşlemler</p>
            <button
              onClick={() => setView("transactions")}
              style={{ background: "transparent", border: "none", fontSize: 12, color: S.green, cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 800 }}
            >
              Tümünü Gör
            </button>
          </div>
          {[...dashboardTxs]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4)
            .map((t, i) => {
              const c = catById(t.cat)
              return (
                <div
                  key={t.id}
                  className="tx-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: i === 0 ? "none" : `1px solid ${S.border}30`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: c?.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: c?.color, flexShrink: 0 }}>
                      {c?.name?.[0] || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>
                        {t.desc || "İşlem"}
                      </div>
                      <div style={{ fontSize: 11, color: S.muted }}>
                        {c?.name} · {t.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: t.type === "income" ? S.green : S.red, flexShrink: 0 }}>
                    {t.type === "income" ? "+" : "-"}{TRY(t.amount)}
                  </div>
                </div>
              )
            })}
        </Card>
      </section>
    </div>
  )
}

function CurrencyTicker({ setView }) {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchedAt, setFetchedAt] = useState(null)

  const load = async (bust = false) => {
    setLoading(true)
    if (bust) {
      try { localStorage.removeItem("bf_fx_rates") } catch {}
    }
    const r = await fetchRates()
    setRates(r)
    setFetchedAt(new Date())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const DISPLAY = ["USD", "EUR", "GBP", "CHF", "JPY", "SAR", "AED"]

  const formatRate = (code) => {
    if (!rates) return "..."
    const val = rates[code]
    if (val == null) return "—"
    const decimals = code === "JPY" ? 2 : 4
    return val.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  return (
    <div className="dash-ticker">
      <div className="dash-ticker-items">
        {DISPLAY.map((code) => (
          <div key={code} className="dash-ticker-item">
            <span className="dash-ticker-code">{CURRENCY_SYMBOLS[code] || code} {code}</span>
            <span className="dash-ticker-rate">{formatRate(code)} <span style={{ color: S.muted, fontSize: 10 }}>₺</span></span>
          </div>
        ))}
      </div>
      {fetchedAt && (
        <span className="dash-ticker-time">
          {fetchedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
      <button
        className="dash-ticker-refresh"
        onClick={() => load(true)}
        title="Kurları yenile"
        disabled={loading}
      >
        {loading ? "…" : "↺"}
      </button>
    </div>
  )
}

function MiniCalendar({ txs, recurringRules, setView, className = "" }) {
  const today = new Date().toISOString().slice(0, 10)
  const monthKey = currentMonthKey()
  const [year, month] = monthKey.split("-").map(Number)

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })

  const days = buildMiniCalDays(year, month, today)

  const txMap = useMemo(() => {
    const map = new Map()
    txs.forEach((t) => {
      if (!t.date.startsWith(monthKey)) return
      const cur = map.get(t.date) || { hasIncome: false, hasExpense: false }
      map.set(t.date, {
        hasIncome: cur.hasIncome || t.type === "income",
        hasExpense: cur.hasExpense || t.type === "expense",
      })
    })
    return map
  }, [txs, monthKey])

  const upcoming = useMemo(() => {
    const future = [...txMap.entries()]
      .filter(([d]) => d >= today)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 4)
    return future
  }, [txMap, today])

  const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"]

  const dotColor = (info) => {
    if (!info) return null
    if (info.hasIncome && info.hasExpense) return S.amber
    if (info.hasIncome) return S.green
    return S.red
  }

  return (
    <Card className={className}>
      <div className="dash-mini-cal-header">
        <span style={{ fontSize: 13, fontWeight: 800, color: S.text }}>{monthLabel}</span>
        <button
          onClick={() => setView("calendar")}
          style={{ background: "transparent", border: "none", color: S.cyan, fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: FONT_BODY, padding: 0 }}
        >
          → Takvim
        </button>
      </div>
      <div className="dash-mini-cal-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="dash-mini-cal-weekday">{d}</div>
        ))}
        {days.map((cell, i) => {
          const info = cell.inMonth ? txMap.get(cell.dateStr) : null
          const hasTx = !!info
          const dot = dotColor(info)
          return (
            <div
              key={i}
              className={[
                "dash-mini-cal-day",
                cell.inMonth ? "in-month" : "",
                cell.isToday ? "is-today" : "",
                hasTx ? "has-tx" : "",
              ].filter(Boolean).join(" ")}
              onClick={hasTx ? () => setView("calendar") : undefined}
            >
              {cell.dayNum || ""}
              {hasTx && (
                <div className="dash-mini-cal-dots">
                  <div className="dash-mini-cal-dot" style={{ background: dot }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {upcoming.length > 0 && (
        <div className="dash-mini-cal-upcoming">
          <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: S.muted, marginBottom: 2 }}>
            Önümüzdeki İşlemler
          </div>
          {upcoming.map(([date, info]) => (
            <div
              key={date}
              className="dash-mini-cal-upcoming-item"
              onClick={() => setView("calendar")}
            >
              <span style={{ color: dotColor(info) }}>{date.slice(5).replace("-", "/")}</span>
              <strong>{info.hasIncome && info.hasExpense ? "Gelir & Gider" : info.hasIncome ? "Gelir" : "Gider"}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function AISummaryCard({ thisMonthTotals, lastMonthTotals, topExpenseCat, budgetRisks, setView, className = "" }) {
  const bullets = []

  // Gider karşılaştırması
  const expenseDiff = thisMonthTotals.expense - lastMonthTotals.expense
  const expenseDiffPct = lastMonthTotals.expense > 0
    ? Math.round(Math.abs(expenseDiff) / lastMonthTotals.expense * 100)
    : null

  if (expenseDiff > 0 && expenseDiffPct !== null) {
    bullets.push({ icon: "up", color: S.red, text: `Bu ay giderler geçen aya göre %${expenseDiffPct} arttı (${TRY(Math.abs(expenseDiff))}).` })
  } else if (expenseDiff < 0 && expenseDiffPct !== null) {
    bullets.push({ icon: "down", color: S.green, text: `Bu ay giderler geçen aya göre %${expenseDiffPct} azaldı (${TRY(Math.abs(expenseDiff))}).` })
  } else if (lastMonthTotals.expense === 0 && thisMonthTotals.expense > 0) {
    bullets.push({ icon: "neutral", color: S.muted, text: "Geçen aya ait gider kaydı yok; karşılaştırma yapılamadı." })
  }

  // Tasarruf oranı
  if (thisMonthTotals.income > 0) {
    const savingsRate = Math.round((thisMonthTotals.net / thisMonthTotals.income) * 100)
    if (savingsRate >= 20) {
      bullets.push({ icon: "spark", color: S.green, text: `Tasarruf oranı %${savingsRate} — sağlıklı düzeyde.` })
    } else if (savingsRate > 0) {
      bullets.push({ icon: "target", color: S.amber, text: `Tasarruf oranı %${savingsRate} — hedef %20'nin altında.` })
    } else {
      bullets.push({ icon: "warning", color: S.red, text: "Bu ay giderler geliri aşıyor; negatif nakit akışı." })
    }
  }

  // En büyük gider kategorisi
  if (topExpenseCat && thisMonthTotals.expense > 0) {
    const pct = Math.round((topExpenseCat.value / thisMonthTotals.expense) * 100)
    bullets.push({ icon: "category", color: topExpenseCat.color || S.cyan, text: `En büyük gider: ${topExpenseCat.name} — ${TRY(topExpenseCat.value)} (giderlerin %${pct}'i).` })
  }

  // Bütçe riski özeti
  const overBudget = budgetRisks.filter((r) => r.pct >= 100)
  const nearBudget = budgetRisks.filter((r) => r.pct >= 80 && r.pct < 100)
  if (overBudget.length > 0) {
    bullets.push({ icon: "alert", color: S.red, text: `${overBudget.length} kategori bütçe limitini aştı: ${overBudget.map((r) => r.name).join(", ")}.` })
  } else if (nearBudget.length > 0) {
    bullets.push({ icon: "warning", color: S.amber, text: `${nearBudget[0].name} bütçesinde %${Math.round(nearBudget[0].pct)} kullanıldı — dikkat.` })
  } else if (budgetRisks.length === 0 && thisMonthTotals.expense > 0) {
    bullets.push({ icon: "check", color: S.green, text: "Tüm bütçe kategorileri limit altında seyrediyor." })
  }

  if (bullets.length === 0) {
    bullets.push({ icon: "neutral", color: S.muted, text: "Henüz yeterli işlem verisi yok." })
  }

  return (
    <Card className={className}>
      <div className="dashboard-card-title-row">
        <span className="app-icon-box dashboard-card-icon" style={{ color: S.cyan }}>
          <DashboardIcon name="analysis" />
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: S.text, letterSpacing: 0 }}>Finansal Analiz</h2>
        <span style={{ marginLeft: "auto", fontSize: 11, color: S.muted, flexShrink: 0 }}>Bu ay · otomatik</span>
      </div>
      <div className="dash-ai-bullets">
        {bullets.slice(0, 4).map((b, i) => (
          <div key={i} className="dash-ai-bullet">
            <div
              className="dash-ai-bullet-icon"
              style={{ background: b.color + "22", color: b.color }}
            >
              <DashboardIcon name={b.icon} />
            </div>
            <span>{b.text}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setView("coach")}
        style={{
          marginTop: 12,
          background: "transparent",
          border: `1px solid ${S.cyan}44`,
          color: S.cyan,
          borderRadius: 8,
          padding: "8px 14px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 800,
          fontFamily: FONT_BODY,
          width: "100%",
        }}
      >
        Detaylı Analiz →
      </button>
    </Card>
  )
}

function DashboardIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  }
  const icons = {
    balance: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </>
    ),
    income: (
      <>
        <path d="M12 5v14" />
        <path d="m7 10 5-5 5 5" />
      </>
    ),
    expense: (
      <>
        <path d="M12 5v14" />
        <path d="m7 14 5 5 5-5" />
      </>
    ),
    health: (
      <>
        <path d="M20 13c0 5-3.5 7-8 8-4.5-1-8-3-8-8V6l8-3 8 3v7Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    warning: (
      <>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 4.4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
      </>
    ),
    analysis: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),
    up: <path d="m6 15 6-6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    neutral: <circle cx="12" cy="12" r="7" />,
    spark: (
      <>
        <path d="M12 3v5" />
        <path d="M12 16v5" />
        <path d="M3 12h5" />
        <path d="M16 12h5" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    category: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </>
    ),
    check: <path d="m5 12 4 4 10-10" />,
  }

  return <svg {...common}>{icons[name] || icons.neutral}</svg>
}

function buildMiniCalDays(year, month, today) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7 // Pazartesi = 0

  const cells = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dateStr: null, dayNum: null, inMonth: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    cells.push({ dateStr, dayNum: d, inMonth: true, isToday: dateStr === today })
  }
  while (cells.length < 42) {
    cells.push({ dateStr: null, dayNum: null, inMonth: false, isToday: false })
  }
  return cells
}

function filterTransactionsByPeriod(txs, period) {
  if (period === "all") return txs

  const now = new Date()
  const from = new Date(now)
  if (period === "year") {
    from.setMonth(0, 1)
  } else if (period === "quarter") {
    from.setMonth(now.getMonth() - 2, 1)
  } else {
    from.setDate(1)
  }

  const fromKey = from.toISOString().slice(0, 10)
  return txs.filter((tx) => tx.date >= fromKey)
}
