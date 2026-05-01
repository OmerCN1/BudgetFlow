import { useEffect, useMemo, useRef, useState } from "react"

import { buildCoachSummary } from "../../utils/finance"
import { TRY } from "../../utils/helpers"

export default function AICoach({
  txs,
  cats,
  goals,
  recurringRules,
  aiMessages,
  aiInsights,
  onAskCoach,
  onNewChat,
}) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const summary = useMemo(
    () => buildCoachSummary({ txs, cats, goals, recurringRules }),
    [txs, cats, goals, recurringRules]
  )
  const proactiveInsights = useMemo(() => buildProactiveInsights(summary), [summary])
  const visibleInsights = useMemo(
    () => [...proactiveInsights, ...aiInsights].slice(0, 5),
    [proactiveInsights, aiInsights]
  )
  const coachMetrics = useMemo(() => buildCoachMetrics(summary), [summary])
  const recurringDue = useMemo(
    () =>
      (summary?.recurringRules || [])
        .slice()
        .sort((a, b) => String(a.nextDate || "").localeCompare(String(b.nextDate || "")))
        .slice(0, 3),
    [summary]
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [aiMessages, loading])

  const ask = async (prompt = message) => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      await onAskCoach(prompt.trim(), summary)
      setMessage("")
    } finally {
      setLoading(false)
    }
  }

  const starters = [
    "Bu ay nerede para kaçırıyorum?",
    "En çok hangi mekanlarda harcadım?",
    "Bütçe aşımı risklerimi analiz et",
  ]

  const introMessage = buildIntroMessage(summary)
  const startNewChat = () => {
    setMessage("")
    onNewChat?.()
  }

  return (
    <section className="ai-coach-page" aria-label="AI Finans Koçu">
      <div className="ai-chat-panel">
        <div className="ai-chat-head">
          <div className="ai-chat-title">
            <div className="ai-coach-orb" aria-hidden="true">
              <Icon name="bot" />
            </div>
            <div>
              <h1>AI Finans Koçu</h1>
              <div className="ai-online-row">
                <span aria-hidden="true" />
                <b>Çevrimiçi</b>
              </div>
            </div>
          </div>
          <button type="button" className="ai-new-chat-button" onClick={startNewChat}>
            Yeni sohbet
          </button>
        </div>

        <div className="ai-message-list">
          <MessageBubble role="assistant" content={introMessage} />

          <div className="ai-prompt-row" aria-label="Hızlı sorular">
            {starters.map((starter) => (
              <button key={starter} type="button" className="quick-prompt-btn" onClick={() => ask(starter)} disabled={loading}>
                {starter}
              </button>
            ))}
          </div>

          {aiMessages.map((item) => (
            <MessageBubble key={item.id} role={item.role} content={item.content} />
          ))}

          {loading && (
            <div className="ai-message-row">
              <div className="ai-message-avatar" aria-hidden="true">
                <Icon name="bot" />
              </div>
              <div className="ai-typing" aria-label="AI Koç düşünüyor">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="ai-chat-input"
          onSubmit={(event) => {
            event.preventDefault()
            ask()
          }}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Bir soru sorun..."
            aria-label="AI Koç'a soru sorun"
          />
          <button type="submit" disabled={loading || !message.trim()} aria-label="Gönder">
            <Icon name="send" />
          </button>
        </form>
      </div>

      <aside className="ai-insights-panel" aria-label="Akıllı İçgörüler">
        <div className="ai-side-title">
          <Icon name="lightbulb" />
          <h2>Akıllı İçgörüler</h2>
        </div>

        <div className="ai-insight-stack">
          {coachMetrics.map((metric) => (
            <InsightMetric key={metric.id} metric={metric} />
          ))}

          {visibleInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>

        <div className="ai-payments-card">
          <h3>Yaklaşan Ödemeler</h3>
          {recurringDue.length === 0 ? (
            <p>Aktif tekrarlı ödeme görünmüyor.</p>
          ) : (
            <div className="ai-payment-list">
              {recurringDue.map((rule) => (
                <div key={`${rule.name}-${rule.nextDate}`} className="ai-payment-row">
                  <span aria-hidden="true">
                    <Icon name={rule.type === "income" ? "income" : "calendar"} />
                  </span>
                  <div>
                    <strong>{rule.name}</strong>
                    <small>{rule.nextDate || "Tarih yok"}</small>
                  </div>
                  <b>{TRY(rule.amount || 0)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="ai-disclaimer">Bu bilgiler bütçe rehberliği amaçlıdır, yatırım tavsiyesi değildir.</p>
      </aside>
    </section>
  )
}

function MessageBubble({ role, content }) {
  const isUser = role === "user"
  return (
    <div className={`ai-message-row${isUser ? " is-user" : ""}`}>
      <div className="ai-message-avatar" aria-hidden="true">
        {isUser ? "S" : <Icon name="bot" />}
      </div>
      <div className={`ai-message-bubble${isUser ? "" : " assistant-message"}`}>{content}</div>
    </div>
  )
}

function InsightMetric({ metric }) {
  return (
    <article className={`ai-metric-card is-${metric.tone}`}>
      <div className="ai-card-kicker">
        <Icon name={metric.icon} />
        <span>{metric.label}</span>
      </div>
      <p>{metric.body}</p>
      {metric.progress == null ? (
        <strong className="finance-number">{metric.value}</strong>
      ) : (
        <>
          <div className="ai-progress-track">
            <span style={{ width: `${Math.min(metric.progress, 100)}%` }} />
          </div>
          <div className="ai-progress-labels">
            <span>{metric.value}</span>
            <span>{metric.limit}</span>
          </div>
        </>
      )}
    </article>
  )
}

function InsightCard({ insight }) {
  return (
    <article className={`ai-mini-insight is-${insight.severity || "info"}`}>
      <div className="ai-card-kicker">
        <Icon name={insightIcon(insight.severity)} />
        <span>{insight.title}</span>
      </div>
      <p>{insight.body}</p>
    </article>
  )
}

function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  }
  const paths = {
    bot: (
      <>
        <rect x="6" y="8" width="12" height="10" rx="3" />
        <path d="M12 4v4M9.5 12h.01M14.5 12h.01M10 16h4M7.5 8 5 5.5M16.5 8 19 5.5" />
      </>
    ),
    send: (
      <>
        <path d="M4 12 20 5l-5.5 14-3-6.5L4 12Z" />
        <path d="m11.5 12.5 8-7.5" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14c-.8.7-1.1 1.6-1.2 2H9.7c-.1-.7-.4-1.2-1.2-1.5Z" />
      </>
    ),
    savings: (
      <>
        <path d="M5 11.5c0-3.1 2.7-5.5 6.8-5.5H17a2 2 0 0 1 2 2v7.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4Z" />
        <path d="M8 18.5V21M16 18.5V21M8.5 11h.01M19 10h2.2M13 6V3.8M11 3.8h4" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 9 16H3L12 3Z" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
    trend: (
      <>
        <path d="m4 16 5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    ),
    income: (
      <>
        <path d="M12 19V5M7 10l5-5 5 5" />
        <path d="M5 19h14" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11.5v4.5M12 8h.01" />
      </>
    ),
  }

  return <svg {...common}>{paths[name] || paths.info}</svg>
}

function buildIntroMessage(summary) {
  const topCategory = summary?.topExpenseCategories?.[0]
  const budgetRisk = summary?.budgetStatus?.find((item) => item.budget > 0 && item.spent / item.budget >= 0.8)

  if (budgetRisk) {
    return `${budgetRisk.name} kategorisinde bütçenin %${Math.round((budgetRisk.spent / budgetRisk.budget) * 100)} seviyesindesin. İstersen riskleri ve hızlı azaltma adımlarını birlikte çıkarabiliriz.`
  }

  if (topCategory) {
    return `Merhaba! Bu ay en yoğun harcama alanın ${topCategory.name}. Harcama ritmini, bütçe risklerini ve tasarruf fırsatlarını birlikte okuyabilirim.`
  }

  return "Merhaba! İşlemleriniz geldikçe bütçe risklerini, tasarruf fırsatlarını ve yaklaşan ödemeleri burada analiz edeceğim."
}

function buildCoachMetrics(summary) {
  const totals = summary?.totals || { income: 0, expense: 0, net: 0 }
  const previous = summary?.previousMonthTotals || { expense: 0 }
  const budgetRisk = (summary?.budgetStatus || [])
    .filter((item) => item.budget > 0)
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget)[0]
  const recurringExpense = (summary?.recurringRules || [])
    .filter((rule) => rule.type !== "income")
    .reduce((total, rule) => total + (rule.amount || 0), 0)
  const topCategory = summary?.topExpenseCategories?.[0]
  const savingValue = Math.round(Math.max(recurringExpense * 0.15, (topCategory?.value || 0) * 0.12))
  const expenseChange = previous.expense > 0 ? ((totals.expense - previous.expense) / previous.expense) * 100 : 0

  const metrics = [
    {
      id: "saving",
      icon: "savings",
      label: "Tasarruf Fırsatı",
      body: savingValue > 0 ? "Tekrarlı ve yüksek hacimli giderlerde optimize edilebilir alan var." : "Yeterli veri oluşunca tasarruf alanlarını işaretleyeceğim.",
      value: TRY(savingValue),
      tone: "success",
    },
    {
      id: "forecast",
      icon: "trend",
      label: "Ay Sonu Sinyali",
      body: previous.expense > 0 ? `Gider ritmi geçen aya göre %${Math.abs(Math.round(expenseChange))} ${expenseChange >= 0 ? "yüksek" : "düşük"}.` : "Bu ayki net akış şu anki kayıtlarla hesaplandı.",
      value: TRY(totals.net),
      tone: totals.net >= 0 ? "info" : "danger",
    },
  ]

  if (budgetRisk) {
    metrics.splice(1, 0, {
      id: "budget-risk",
      icon: "warning",
      label: "Bütçe Uyarısı",
      body: `${budgetRisk.name} limitine yaklaştın.`,
      value: TRY(budgetRisk.spent),
      limit: TRY(budgetRisk.budget),
      progress: Math.round((budgetRisk.spent / budgetRisk.budget) * 100),
      tone: budgetRisk.spent > budgetRisk.budget ? "danger" : "warning",
    })
  }

  return metrics
}

function insightIcon(severity) {
  if (severity === "danger" || severity === "warning") return "warning"
  if (severity === "success") return "savings"
  return "info"
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

  const topLocations = summary?.topLocations || []
  if (topLocations.length > 0) {
    const top = topLocations[0]
    insights.push({
      id: "proactive-top-location",
      title: "En çok harcanan mekan",
      body: `Bu ay ${top.location} konumunda ${Math.round(top.amount).toLocaleString("tr-TR")} TL harcandı.`,
      severity: "info",
    })
  }

  return insights.slice(0, 3)
}
