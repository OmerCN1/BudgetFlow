import { useMemo, useState } from "react"
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
import { categoryTotals, currentMonthKey, previousMonthKey, totalsFor, transactionsForMonth } from "../../utils/finance"

export default function Dashboard({ txs, cats, catById, setView }) {
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

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: S.green, fontSize: 12, fontWeight: 800, letterSpacing: 0, textTransform: "uppercase", marginBottom: 10 }}>
            Luminous Wealth
          </div>
          <h1 style={{ color: S.text, fontSize: 32, lineHeight: 1.2, fontWeight: 800, letterSpacing: 0 }}>
            Finansal Özet
          </h1>
          <p style={{ color: S.sub, fontSize: 16, marginTop: 10 }}>
            {monthLabel} itibarıyla varlık durumunuz.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            ["month", "Bu Ay"],
            ["quarter", "Son 3 Ay"],
            ["year", "Yıl"],
            ["all", "Tümü"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                background: period === value ? "rgba(78,222,163,0.16)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${period === value ? S.green : S.border}`,
                color: period === value ? S.green : S.sub,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                fontFamily: FONT_BODY,
                fontWeight: 800,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setView("transactions")}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${S.border}`,
              color: S.green,
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: FONT_BODY,
              fontWeight: 800,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            İşlem Merkezi
          </button>
        </div>
      </section>

      <section className="luminous-stat-grid">
        {[
          {
            label: "Net Bakiye",
            value: balance,
            color: balance >= 0 ? S.green : S.red,
            sign: true,
            caption: `${txs.length} işlem`,
            icon: "▣",
          },
          {
            label: "Toplam Gelir",
            value: totalIncome,
            color: S.cyan,
            caption: `${dashboardTxs.filter((t) => t.type === "income").length} gelir kaydı`,
            icon: "↓",
          },
          {
            label: "Toplam Gider",
            value: totalExpense,
            color: S.rose,
            caption: `${dashboardTxs.filter((t) => t.type === "expense").length} gider kaydı`,
            icon: "↑",
          },
          {
            label: "Sağlık Skoru",
            value: healthScore,
            color: healthScore >= 78 ? S.green : healthScore >= 58 ? S.amber : S.red,
            caption: healthScore >= 78 ? "Güçlü finansal ritim" : healthScore >= 58 ? "Yakın takip gerekli" : "Aksiyon zamanı",
            icon: "◎",
            raw: true,
          },
        ].map((s, i) => (
          <Card
            key={i}
            style={{
              minHeight: 178,
              display: "grid",
              alignContent: "space-between",
              background:
                i === 0
                  ? "linear-gradient(135deg, rgba(78,222,163,0.12), rgba(255,255,255,0.045))"
                  : "rgba(255,255,255,0.045)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <FieldLabel>{s.label}</FieldLabel>
              <span style={{ color: s.color, fontSize: 24, lineHeight: 1 }}>{s.icon}</span>
            </div>
            <div
              className="finance-number stat-value"
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: s.color,
                lineHeight: 1.1,
              }}
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
            <div style={{ color: i === 0 ? S.green : S.muted, fontSize: 14 }}>
              {s.caption}
            </div>
          </Card>
        ))}
      </section>

      <section className="luminous-two-col">
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: "#002113", background: S.green, boxShadow: "0 0 28px rgba(78,222,163,0.26)" }}>
              ●
            </span>
            <h2 style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 800, color: S.text, letterSpacing: 0 }}>
              Bu Ay Ne Oldu?
            </h2>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ border: `1px solid ${S.border}`, background: "rgba(9,16,12,0.54)", borderRadius: 8, padding: 18 }}>
              <FieldLabel>Net Nakit Akışı</FieldLabel>
              <div className="finance-number" style={{ color: thisMonthTotals.net >= 0 ? S.green : S.red, fontSize: 20, fontWeight: 800 }}>
                {thisMonthTotals.net >= 0 ? "+" : ""}
                {TRY(thisMonthTotals.net)}
              </div>
            </div>

            <div style={{ border: `1px solid ${S.border}`, background: "rgba(9,16,12,0.54)", borderRadius: 8, padding: 18 }}>
              <FieldLabel>En Büyük Gider</FieldLabel>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "baseline" }}>
                <span style={{ color: S.text, fontSize: 15 }}>
                  {topThisMonthExpense?.name || "Henüz gider yok"}
                </span>
                <span className="finance-number" style={{ color: topThisMonthExpense?.color || S.muted, fontSize: 18, fontWeight: 800 }}>
                  {topThisMonthExpense ? TRY(topThisMonthExpense.value) : TRY(0)}
                </span>
              </div>
              <div style={{ color: S.muted, fontSize: 12, marginTop: 10 }}>
                Geçen aya göre gider farkı{" "}
                <span className="finance-number" style={{ color: thisMonthTotals.expense > lastMonthTotals.expense ? S.red : S.green }}>
                  {TRY(thisMonthTotals.expense - lastMonthTotals.expense)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
            <span style={{ color: S.rose, fontSize: 26, lineHeight: 1 }}>△</span>
            <h2 style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 800, color: S.text, letterSpacing: 0 }}>
              Bütçe Riskleri
            </h2>
          </div>
          {budgetRisks.length === 0 ? (
            <div style={{ color: S.green, fontSize: 15 }}>Bu ay kritik bütçe aşımı görünmüyor.</div>
          ) : (
            <div style={{ display: "grid", gap: 28 }}>
              {budgetRisks.slice(0, 3).map((cat) => (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: S.text, fontSize: 15, marginBottom: 10 }}>
                    <span>{cat.name}</span>
                    <span className="finance-number">{TRY(cat.spent)} / {TRY(cat.budget)}</span>
                  </div>
                  <div style={{ background: "rgba(187,202,191,0.14)", borderRadius: 999, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(cat.pct, 100)}%`,
                        height: "100%",
                        background:
                          cat.pct >= 100
                            ? `linear-gradient(90deg, ${S.red}, ${S.rose})`
                            : `linear-gradient(90deg, ${S.green}, ${S.cyan})`,
                        boxShadow: `0 0 18px ${cat.pct >= 100 ? S.red : S.cyan}`,
                      }}
                    />
                  </div>
                  <div style={{ color: cat.pct >= 100 ? S.rose : S.muted, fontSize: 13, textAlign: "right", marginTop: 8 }}>
                    %{Math.round(cat.pct)} kullanıldı
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            {budgetAlerts.map((alert) => (
              <div key={`${alert.title}-${alert.body}`} style={{ border: `1px solid ${alert.tone}44`, background: `${alert.tone}10`, borderRadius: 8, padding: 12 }}>
                <div style={{ color: alert.tone, fontWeight: 800, fontSize: 13 }}>{alert.title}</div>
                <div style={{ color: S.sub, fontSize: 12, marginTop: 4 }}>{alert.body}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="luminous-chart-grid charts-grid">
        <Card>
          <FieldLabel>Aylık Gelir &amp; Gider Trendi</FieldLabel>
          <ResponsiveContainer width="100%" height={220}>
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
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            {[{ c: S.green, l: "Gelir" }, { c: S.red, l: "Gider" }].map(
              ({ c, l }) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: S.sub,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 2.5,
                      background: c,
                      borderRadius: 2,
                    }}
                  />
                  {l}
                </div>
              )
            )}
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column" }}>
          <FieldLabel>Gider Dağılımı</FieldLabel>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={52}
                outerRadius={78}
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
                  background: "rgba(14,21,17,0.92)",
                  border: `1px solid ${S.border}`,
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: FONT_BODY,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              marginTop: "auto",
            }}
          >
            {pieData.slice(0, 5).map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: d.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: S.sub,
                      maxWidth: 80,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: S.text,
                  }}
                >
                  {TRY(d.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <FieldLabel>Son İşlemler</FieldLabel>
          <button
            onClick={() => setView("transactions")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 12,
              color: S.green,
              cursor: "pointer",
              fontFamily: FONT_BODY,
              fontWeight: 800,
            }}
          >
            Tümünü Gör
          </button>
        </div>

        {[...dashboardTxs]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6)
          .map((t, i) => {
            const c = catById(t.cat)
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderTop:
                    i === 0 ? "none" : `1px solid ${S.border}30`,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: c?.color + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      color: c?.color,
                      flexShrink: 0,
                    }}
                  >
                    {c?.name?.[0] || "?"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: S.text,
                      }}
                    >
                      {t.desc || "İşlem"}
                    </div>
                    <div style={{ fontSize: 11, color: S.muted }}>
                      {c?.name} · {t.date}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.type === "income" ? S.green : S.red,
                    flexShrink: 0,
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {TRY(t.amount)}
                </div>
              </div>
            )
          })}
      </Card>
    </div>
  )
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

function calculateHealthScore({ totals, budgetRisks, cats }) {
  let score = 82
  if (totals.income > 0) {
    const expenseRatio = totals.expense / totals.income
    if (expenseRatio > 1) score -= 24
    else if (expenseRatio > 0.85) score -= 14
    else if (expenseRatio < 0.65) score += 6
  } else if (totals.expense > 0) {
    score -= 20
  }

  budgetRisks.forEach((risk) => {
    score -= risk.pct >= 100 ? 14 : 7
  })

  const budgetedCount = cats.filter((cat) => !cat.isIncome && !cat.isArchived && cat.budget > 0).length
  if (budgetedCount >= 3) score += 5
  if (totals.net > 0) score += 7

  return Math.max(0, Math.min(100, Math.round(score)))
}
