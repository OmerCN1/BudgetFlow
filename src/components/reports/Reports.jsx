import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_BODY, FONT_MONO } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import { categoryTotals, monthLabel, monthKey, totalsFor } from "../../utils/finance"

export default function Reports({ txs, cats }) {
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

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
        {[
          { label: "Bu Ay Net", value: TRY(totals.net), color: totals.net >= 0 ? S.green : S.red },
          { label: "Bu Ay Gider", value: TRY(totals.expense), color: S.red },
          { label: "6 Ay Ort. Gider", value: TRY(avgExpense), color: S.amber },
          { label: "Aktif Kategori", value: cats.filter((cat) => !cat.isArchived).length, color: S.sub },
        ].map((stat) => (
          <Card key={stat.label}>
            <FieldLabel>{stat.label}</FieldLabel>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 18, color: stat.color }}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 10 }}>
        <Card>
          <FieldLabel>6 Aylık Gelir, Gider ve Net</FieldLabel>
          {hasTransactions ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid stroke={`${S.border}80`} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: S.muted, fontSize: 11, fontFamily: FONT_BODY }} />
                <YAxis tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_MONO }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(v) => TRY(v)}
                  contentStyle={{ background: S.card2, border: `1px solid ${S.border}`, color: S.text }}
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

        <Card>
          <FieldLabel>Bu Ay Kategori Dağılımı</FieldLabel>
          {expenseCats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseCats} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {expenseCats.map((item) => <Cell key={item.catId} fill={item.color} />)}
                </Pie>
                <Tooltip formatter={(v) => TRY(v)} contentStyle={{ background: S.card2, border: `1px solid ${S.border}`, color: S.text }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart compact />
          )}
          <MiniList items={expenseCats.slice(0, 5)} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card>
          <FieldLabel>En Çok Harcananlar</FieldLabel>
          <MiniList items={expenseCats.slice(0, 8)} />
        </Card>
        <Card>
          <FieldLabel>Gelir Kaynakları</FieldLabel>
          <MiniList items={incomeCats.slice(0, 8)} />
        </Card>
      </div>
    </div>
  )
}

function EmptyChart({ compact = false }) {
  return (
    <div
      style={{
        height: compact ? 120 : 260,
        display: "grid",
        placeItems: "center",
        border: `1px dashed ${S.border}`,
        borderRadius: 8,
        color: S.muted,
        fontSize: 13,
        background: "#08111f",
      }}
    >
      Rapor için işlem verisi bekleniyor.
    </div>
  )
}

function MiniList({ items }) {
  if (items.length === 0) {
    return <div style={{ color: S.muted, fontSize: 13 }}>Bu dönem için veri yok.</div>
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((item) => (
        <div key={item.catId} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
          <span style={{ color: S.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <span style={{ color: item.color, marginRight: 6 }}>●</span>
            {item.name}
          </span>
          <strong style={{ color: S.text, fontFamily: FONT_MONO }}>{TRY(item.value)}</strong>
        </div>
      ))}
    </div>
  )
}
