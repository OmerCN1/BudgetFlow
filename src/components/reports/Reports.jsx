import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import Card from "../ui/Card"
import { S, FONT_BODY, FONT_MONO } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import { categoryTotals, monthLabel, monthKey, totalsFor } from "../../utils/finance"

export default function Reports({
  txs,
  cats,
  assets = [],
  assetSnapshots = [],
  creditCards = [],
  creditCardPayments = [],
  recurringRules = [],
  debts = [],
  debtPayments = [],
  subscription,
}) {
  const monthKeys = [...new Set(txs.map((tx) => monthKey(tx.date)))].sort().slice(-6)
  const monthlyData = monthKeys.map((key) => {
    const totals = totalsFor(txs.filter((tx) => monthKey(tx.date) === key))
    return {
      month: monthLabel(key),
      Gelir: totals.income,
      Gider: totals.expense,
      Net: totals.net,
    }
  })
  const thisMonth = monthKeys.at(-1) || monthKey(new Date().toISOString().slice(0, 10))
  const thisMonthTxs = txs.filter((tx) => monthKey(tx.date) === thisMonth)
  const expenseCats = categoryTotals(thisMonthTxs, cats, "expense")
  const incomeCats = categoryTotals(thisMonthTxs, cats, "income")
  const totals = totalsFor(thisMonthTxs)
  const avgExpense = monthlyData.length
    ? monthlyData.reduce((total, row) => total + row.Gider, 0) / monthlyData.length
    : 0
  const hasTransactions = txs.length > 0
  const daysInMonth = new Date(Number(thisMonth.slice(0, 4)), Number(thisMonth.slice(5, 7)), 0).getDate()
  const elapsedDay = thisMonth === monthKey(new Date().toISOString().slice(0, 10)) ? new Date().getDate() : daysInMonth
  const monthEndForecast = elapsedDay > 0 ? (totals.expense / elapsedDay) * daysInMonth : totals.expense
  const monthlySubscriptions = recurringRules
    .filter((rule) => rule.isActive && rule.type === "expense")
    .reduce((total, rule) => total + (rule.frequency === "weekly" ? rule.amount * 4.33 : rule.amount), 0)
  const cardDebt = creditCards.reduce((total, card) => total + card.currentDebt, 0)
  const cardLimit = creditCards.reduce((total, card) => total + card.creditLimit, 0)
  const cardUsage = cardLimit > 0 ? (cardDebt / cardLimit) * 100 : 0
  const netDebt = buildDebtTotals(debts, debtPayments)
  const latestAssetValue = latestPortfolioValue(assetSnapshots, assets)
  const netWorth = latestAssetValue - cardDebt - netDebt.iOwe + netDebt.owedToMe
  const assetTrend = buildAssetTrend(assetSnapshots)
  const cardRows = creditCards.map((card) => ({
    name: card.name,
    value: card.currentDebt,
    color: card.color || S.red,
  }))
  const upcomingDebts = debts
    .filter((debt) => !debt.isSettled && debt.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
  const subscriptionPlan = subscription?.planId === "premium" ? "Premium" : subscription?.planId === "standard" ? "Standart" : "Ücretsiz"

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Analiz</span>
          <h1 className="page-title">Raporlar</h1>
          <p className="page-subtitle">Harcama ve gelir trendlerinize genel bakış.</p>
        </div>
      </div>

      <div className="stat-bar">
        {[
          { label: "Bu Ay Net", value: TRY(totals.net), color: totals.net >= 0 ? S.green : S.red },
          { label: "Bu Ay Gider", value: TRY(totals.expense), color: S.red },
          { label: "Ay Sonu Tahmini", value: TRY(monthEndForecast), color: monthEndForecast > avgExpense ? S.amber : S.cyan },
          { label: "Net Varlık", value: TRY(netWorth), color: netWorth >= 0 ? S.green : S.red },
        ].map((stat) => (
          <div key={stat.label} className="stat-bar-item stagger-item">
            <span className="stat-bar-label">{stat.label}</span>
            <span className="stat-bar-value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="reports-main-grid" style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 10 }}>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">6 Aylık Gelir, Gider ve Net</p>
            <span className="chart-card-meta">Son 6 ay</span>
          </div>
          {hasTransactions ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid stroke={`${S.border}80`} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: S.muted, fontSize: 11, fontFamily: FONT_BODY }} />
                <YAxis tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_MONO }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(v) => TRY(v)}
                  contentStyle={{
                    background: "var(--bf-tooltip-bg)",
                    border: "1px solid var(--bf-tooltip-border)",
                    borderRadius: 8,
                    color: "var(--bf-tooltip-text)",
                    boxShadow: "var(--bf-tooltip-shadow)",
                  }}
                />
                <Bar dataKey="Gelir" fill={S.green} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gider" fill={S.red} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Net" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </Card>

        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Bu Ay Kategori Dağılımı</p>
            <span className="chart-card-meta">Gider dağılımı</span>
          </div>
          {expenseCats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseCats} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {expenseCats.map((item) => <Cell key={item.catId} fill={item.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => TRY(v)}
                  contentStyle={{
                    background: "var(--bf-tooltip-bg)",
                    border: "1px solid var(--bf-tooltip-border)",
                    borderRadius: 8,
                    color: "var(--bf-tooltip-text)",
                    boxShadow: "var(--bf-tooltip-shadow)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart compact />
          )}
          <MiniList items={expenseCats.slice(0, 5)} />
        </Card>
      </div>

      <div className="reports-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">En Çok Harcananlar</p>
            <span className="chart-card-meta">Bu ay</span>
          </div>
          <MiniList items={expenseCats.slice(0, 8)} />
        </Card>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Gelir Kaynakları</p>
            <span className="chart-card-meta">Bu ay</span>
          </div>
          <MiniList items={incomeCats.slice(0, 8)} />
        </Card>
      </div>

      <div className="reports-main-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 10 }}>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Net Varlık ve Portföy</p>
            <span className="chart-card-meta">Snapshot geçmişi</span>
          </div>
          {assetTrend.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={assetTrend}>
                <CartesianGrid stroke={`${S.border}70`} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_BODY }} />
                <YAxis tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_MONO }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => TRY(v)} contentStyle={tooltipStyle()} />
                <Line type="monotone" dataKey="value" stroke={S.green} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart compact />
          )}
          <div className="mini-finance-list">
            <div className="mini-finance-row"><span>Portföy değeri</span><strong>{TRY(latestAssetValue)}</strong></div>
            <div className="mini-finance-row"><span>Kart borcu</span><strong>{TRY(cardDebt)}</strong></div>
            <div className="mini-finance-row"><span>Kişisel net borç</span><strong>{TRY(netDebt.iOwe - netDebt.owedToMe)}</strong></div>
          </div>
        </Card>

        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Kredi Kartı Borç Dağılımı</p>
            <span className="chart-card-meta">%{Math.round(cardUsage)} kullanım</span>
          </div>
          {cardRows.some((row) => row.value > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={cardRows} dataKey="value" innerRadius={44} outerRadius={72} paddingAngle={3}>
                  {cardRows.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip formatter={(v) => TRY(v)} contentStyle={tooltipStyle()} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart compact />
          )}
          <MiniList items={cardRows.map((row) => ({ catId: row.name, name: row.name, value: row.value, color: row.color })).slice(0, 5)} />
        </Card>
      </div>

      <div className="reports-main-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Abonelik Yükü</p>
            <span className="chart-card-meta">{subscriptionPlan} plan</span>
          </div>
          <MiniList items={[
            { catId: "subs", name: "Aylık tekrarlı gider", value: monthlySubscriptions, color: S.rose },
            { catId: "yearly", name: "Yıllık projeksiyon", value: monthlySubscriptions * 12, color: S.amber },
          ]} />
        </Card>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Borç Vade Takvimi</p>
            <span className="chart-card-meta">{upcomingDebts.length} yaklaşan kayıt</span>
          </div>
          <MiniList items={upcomingDebts.map((debt) => ({
            catId: debt.id,
            name: `${debt.personName} · ${debt.dueDate}`,
            value: debt.amount,
            color: debt.direction === "i_owe" ? S.red : S.green,
          }))} />
        </Card>
        <Card className="reports-chart-card">
          <div className="chart-card-header">
            <p className="chart-card-title">Kart Ödemeleri</p>
            <span className="chart-card-meta">Son kayıtlar</span>
          </div>
          <MiniList items={creditCardPayments.slice(0, 5).map((payment) => ({
            catId: payment.id,
            name: payment.paymentDate,
            value: payment.amount,
            color: S.green,
          }))} />
        </Card>
      </div>
    </div>
  )
}

function EmptyChart({ compact = false }) {
  return (
    <div className="app-empty-chart" style={{ height: compact ? 120 : 260 }}>
      Rapor için işlem verisi bekleniyor.
    </div>
  )
}

function tooltipStyle() {
  return {
    background: "var(--bf-tooltip-bg)",
    border: "1px solid var(--bf-tooltip-border)",
    borderRadius: 8,
    color: "var(--bf-tooltip-text)",
    boxShadow: "var(--bf-tooltip-shadow)",
  }
}

function latestPortfolioValue(snapshots, assets) {
  if (snapshots.length > 0) {
    const latestDate = snapshots.map((item) => item.snapshotDate).sort().at(-1)
    return snapshots
      .filter((item) => item.snapshotDate === latestDate)
      .reduce((total, item) => total + item.totalValueTRY, 0)
  }
  return assets.reduce((total, asset) => total + Number(asset.quantity || 0) * Number(asset.unitCost || 0), 0)
}

function buildAssetTrend(snapshots) {
  const map = new Map()
  snapshots.forEach((snapshot) => {
    map.set(snapshot.snapshotDate, (map.get(snapshot.snapshotDate) || 0) + snapshot.totalValueTRY)
  })
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, value]) => ({ label: date.slice(5), value }))
}

function buildDebtTotals(debts, payments) {
  const paidByDebt = new Map()
  payments.forEach((payment) => {
    paidByDebt.set(payment.debtId, (paidByDebt.get(payment.debtId) || 0) + payment.amount)
  })
  return debts.filter((debt) => !debt.isSettled).reduce((totals, debt) => {
    const remaining = Math.max(debt.amount - (paidByDebt.get(debt.id) || 0), 0)
    if (debt.direction === "i_owe") totals.iOwe += remaining
    else totals.owedToMe += remaining
    return totals
  }, { iOwe: 0, owedToMe: 0 })
}

function MiniList({ items }) {
  if (items.length === 0) {
    return <div className="mini-list-empty">Bu dönem için veri yok.</div>
  }

  return (
    <div className="mini-finance-list">
      {items.map((item) => (
        <div key={item.catId} className="mini-finance-row">
          <span>
            <span className="mini-finance-dot" style={{ background: item.color }} />
            {item.name}
          </span>
          <strong style={{ color: S.text, fontFamily: FONT_MONO }}>{TRY(item.value)}</strong>
        </div>
      ))}
    </div>
  )
}
