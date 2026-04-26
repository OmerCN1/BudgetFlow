import { useMemo, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_BODY, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { buildCoachSummary } from "../../utils/finance"

export default function AICoach({
  txs,
  cats,
  goals,
  recurringRules,
  aiMessages,
  aiInsights,
  onAskCoach,
}) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const summary = useMemo(
    () => buildCoachSummary({ txs, cats, goals, recurringRules }),
    [txs, cats, goals, recurringRules]
  )
  const proactiveInsights = useMemo(() => buildProactiveInsights(summary), [summary])
  const visibleInsights = [...proactiveInsights, ...aiInsights]

  const ask = async (prompt = message) => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      await onAskCoach(prompt.trim(), summary)
      setMessage("")
    } finally {
      setLoading(false)
    }
  }

  const starters = [
    "Bu ay en çok nerede para kaçırıyorum?",
    "Gelecek ay için 3 tasarruf önerisi ver.",
    "Bütçe aşımı risklerimi analiz et.",
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
      <Card style={{ minHeight: 560, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: S.text }}>AI Koç</div>
            <div style={{ fontSize: 12, color: S.muted }}>
              Harcama farkındalığı ve bütçe önerileri. Yatırım tavsiyesi değildir.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {starters.map((starter) => (
            <button key={starter} onClick={() => ask(starter)} style={{ ...btnGhost, padding: "6px 10px", fontSize: 12 }}>
              {starter}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: "grid", alignContent: "start", gap: 10, overflow: "auto", paddingRight: 4 }}>
          {aiMessages.length === 0 && (
            <div style={{ color: S.muted, fontSize: 13 }}>
              Finans verileriniz özetlenerek AI Koç'a gönderilir. Ham tablo erişimi veya API anahtarı tarayıcıya verilmez.
            </div>
          )}
          {aiMessages.map((item) => (
            <div
              key={item.id}
              style={{
                justifySelf: item.role === "user" ? "end" : "start",
                maxWidth: "82%",
                border: `1px solid ${item.role === "user" ? S.green : S.border}`,
                background: item.role === "user" ? `${S.green}16` : S.card2,
                borderRadius: 8,
                padding: 10,
                color: S.text,
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {item.content}
            </div>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            ask()
          }}
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 12 }}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="AI Koç'a bütçenizle ilgili soru sorun..."
            style={inputStyle}
          />
          <button disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Düşünüyor" : "Sor"}
          </button>
        </form>
      </Card>

      <Card>
        <FieldLabel>AI Analiz Kartları</FieldLabel>
        <div style={{ display: "grid", gap: 10 }}>
          {visibleInsights.length === 0 && (
            <div style={{ color: S.muted, fontSize: 13, fontFamily: FONT_BODY }}>
              İlk sorunuzdan sonra tasarruf fırsatları, anomali uyarıları ve bütçe açıklamaları burada görünür.
            </div>
          )}
          {visibleInsights.map((insight) => (
            <div
              key={insight.id}
              style={{
                border: `1px solid ${toneColor(insight.severity)}55`,
                background: `${toneColor(insight.severity)}12`,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div style={{ color: toneColor(insight.severity), fontWeight: 800, fontSize: 13 }}>{insight.title}</div>
              <div style={{ color: S.sub, fontSize: 12, marginTop: 4 }}>{insight.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function toneColor(severity) {
  if (severity === "danger") return S.red
  if (severity === "warning") return S.amber
  if (severity === "success") return S.green
  return "#06b6d4"
}

function buildProactiveInsights(summary) {
  const insights = []
  const totals = summary?.totals || { income: 0, expense: 0, net: 0 }
  const previous = summary?.previousMonthTotals || { expense: 0 }
  const topCategory = summary?.topExpenseCategories?.[0]
  const budgetRisk = summary?.budgetStatus?.find((item) => item.budget > 0 && item.spent / item.budget >= 0.8)
  const nextRecurring = summary?.recurringRules
    ?.slice()
    .sort((a, b) => String(a.nextDate).localeCompare(String(b.nextDate)))?.[0]

  if (totals.net < 0) {
    insights.push({
      id: "proactive-negative-net",
      title: "Nakit akışı negatife döndü",
      body: "Bu ay giderler gelirlerden yüksek. Önce değişken harcama kategorilerini kısmanız faydalı olur.",
      severity: "danger",
    })
  } else if (totals.income > 0 && totals.net / totals.income >= 0.2) {
    insights.push({
      id: "proactive-saving-rate",
      title: "Tasarruf oranı güçlü",
      body: "Net akışınız gelirinizin %20'sinden yüksek. Bu ritim hedef katkıları için iyi bir alan açıyor.",
      severity: "success",
    })
  }

  if (topCategory) {
    insights.push({
      id: "proactive-top-category",
      title: `${topCategory.name} odağı`,
      body: `Bu ay en yüksek gider alanınız ${topCategory.name}. Küçük bir limit ayarı bile toplam gideri hızlı etkiler.`,
      severity: "info",
    })
  }

  if (budgetRisk) {
    insights.push({
      id: "proactive-budget-risk",
      title: "Bütçe eşiğine yaklaşıldı",
      body: `${budgetRisk.name} kategorisinde ${Math.round((budgetRisk.spent / budgetRisk.budget) * 100)}% kullanım var.`,
      severity: budgetRisk.spent > budgetRisk.budget ? "danger" : "warning",
    })
  }

  if (previous.expense > 0 && totals.expense > previous.expense * 1.2) {
    insights.push({
      id: "proactive-expense-jump",
      title: "Gider artışı hızlandı",
      body: "Bu ay giderler geçen aya göre %20'den fazla yükseldi. Son işlemleri kontrol etmek iyi olur.",
      severity: "warning",
    })
  }

  if (nextRecurring) {
    insights.push({
      id: "proactive-recurring",
      title: "Yaklaşan tekrarlı işlem",
      body: `${nextRecurring.name} için sıradaki tarih ${nextRecurring.nextDate}. Nakit akışı planına dahil edildi.`,
      severity: "info",
    })
  }

  return insights.slice(0, 4)
}
