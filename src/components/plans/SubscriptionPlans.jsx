import { useMemo, useState } from "react"

import Card from "../ui/Card"
import { btnGhost } from "../../constants/theme"

const PLANS = [
  {
    id: "free",
    name: "Ücretsiz",
    monthly: 0,
    badge: "",
    tone: "muted",
    features: ["Gelir/Gider takibi", "3 kategori limiti", "Manuel veri girişi"],
    action: "Başla",
  },
  {
    id: "standard",
    name: "Standart",
    monthly: 49,
    badge: "Popüler",
    tone: "standard",
    features: ["Sınırsız kategori", "Banka entegrasyonu", "Detaylı raporlar"],
    action: "Standart'ı Seç",
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 149,
    badge: "En İyi Değer",
    tone: "premium",
    features: ["AI Finansal Koç", "Otomatik bütçe risk analizi", "Sınırsız hedef", "Öncelikli destek"],
    action: "Premium'a Geç",
  },
]

const COMPARISON = [
  { feature: "Aylık İşlem Limiti", free: "100", standard: "Sınırsız", premium: "Sınırsız" },
  { feature: "Özel Kategoriler", free: "3", standard: "Sınırsız", premium: "Sınırsız" },
  { feature: "Banka Senkronizasyonu", free: false, standard: true, premium: true },
  { feature: "Gelişmiş Raporlar", free: false, standard: true, premium: true },
  { feature: "Yapay Zeka Asistanı", free: false, standard: false, premium: true },
  { feature: "Fiş / Fatura Arşivi", free: "10 belge", standard: "250 belge", premium: "Sınırsız" },
]

export default function SubscriptionPlans({ currentPlan = "premium", onBackAccount }) {
  const [billing, setBilling] = useState("yearly")
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)
  const yearly = billing === "yearly"
  const annualSavings = useMemo(() => PLANS.reduce((sum, plan) => sum + plan.monthly * 12 * 0.2, 0), [])

  const priceFor = (monthly) => {
    const price = yearly ? Math.round(monthly * 0.8) : monthly
    return `₺${price}`
  }

  return (
    <div className="plans-page">
      <section className="plans-hero">
        <button type="button" onClick={onBackAccount} style={btnGhost}>← Profil'e Dön</button>
        <div>
          <span>BudgetFlow Plans</span>
          <h1>Planınızı Seçin</h1>
          <p>Size en uygun bütçe yönetimi deneyimini seçin. Sessiz lüksün ve mutlak kontrolün finansal dünyasına adım atın.</p>
        </div>
        <div className="plans-billing-toggle" role="group" aria-label="Faturalandırma dönemi">
          <button type="button" className={billing === "monthly" ? "is-active" : ""} onClick={() => setBilling("monthly")}>Aylık</button>
          <button type="button" className={billing === "yearly" ? "is-active" : ""} onClick={() => setBilling("yearly")}>
            Yıllık <small>-%20</small>
          </button>
        </div>
      </section>

      <section className="plans-grid">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const isSelected = selectedPlan === plan.id
          return (
            <Card key={plan.id} className={`plan-card is-${plan.tone}${isSelected ? " is-selected" : ""}`}>
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-card-head">
                <h2>{plan.name}</h2>
                <div>
                  <strong>{priceFor(plan.monthly)}</strong>
                  <span>/ay</span>
                </div>
                {yearly && plan.monthly > 0 && <small>Yıllık ödemede ₺{Math.round(plan.monthly * 12 * 0.2)} tasarruf</small>}
              </div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={plan.id === "premium" ? "plan-primary-button" : "plan-secondary-button"}
              >
                {isCurrent ? "Mevcut Plan" : plan.action}
              </button>
            </Card>
          )
        })}
      </section>

      <section className="plans-summary-row">
        <div>
          <strong>{yearly ? "Yıllık plan aktif" : "Aylık plan aktif"}</strong>
          <span>{yearly ? `Yıllık ödeme seçeneğinde ortalama %20 indirim uygulanır.` : "Aylık planlarda taahhüt yoktur."}</span>
        </div>
        <b>{yearly ? `Yıllık örnek tasarruf: ₺${Math.round(annualSavings)}` : "İstediğiniz an yükseltebilirsiniz"}</b>
      </section>

      <section className="plans-comparison">
        <h2>Plan Karşılaştırması</h2>
        <div className="plans-table">
          <div className="plans-table-head">
            <span>Özellikler</span>
            <span>Ücretsiz</span>
            <span>Standart</span>
            <span>Premium</span>
          </div>
          {COMPARISON.map((row) => (
            <div className="plans-table-row" key={row.feature}>
              <span>{row.feature}</span>
              <PlanValue value={row.free} />
              <PlanValue value={row.standard} />
              <PlanValue value={row.premium} premium />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlanValue({ value, premium = false }) {
  if (value === true) return <span className={premium ? "is-premium" : "is-check"}>✓</span>
  if (value === false) return <span className="is-empty">−</span>
  return <span className={premium ? "is-premium" : ""}>{value}</span>
}
