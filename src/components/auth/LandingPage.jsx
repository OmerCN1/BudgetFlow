import { useState } from "react"
import { S, FONT_BODY, FONT_MONO, btnPrimary, btnGhost } from "../../constants/theme"

const features = [
  {
    title: "Akıllı Takip",
    body: "Gelir, gider ve kategori akışınızı tek bir panelde berrak biçimde yönetin.",
    icon: "↗",
    color: S.green,
  },
  {
    title: "Raporlama",
    body: "Aylık trendleri, bütçe risklerini ve nakit akışını görsel olarak okuyun.",
    icon: "▥",
    color: S.cyan,
  },
  {
    title: "Hedef Yönetimi",
    body: "Birikim hedeflerinizi takip edin, limit aşımına yaklaşmadan önlem alın.",
    icon: "◎",
    color: S.rose,
  },
  {
    title: "AI Finans Koçu",
    body: "Harcamalarınızı optimize eden kişisel öneriler ve risk analizleri alın.",
    icon: "✦",
    color: S.green,
  },
]

const transactions = [
  { name: "Premium Coffee Roasters", meta: "Bugün, 09:42", amount: "-₺145.00", tone: S.text, icon: "▣" },
  { name: "Maaş Ödemesi", meta: "Dün, 18:00", amount: "+₺85,400.00", tone: S.green, icon: "↗" },
  { name: "Enerji Faturası", meta: "15 Haz 2026", amount: "-₺1,240.00", tone: S.text, icon: "ϟ" },
]

const plans = [
  {
    name: "Ücretsiz",
    monthly: 0,
    note: "Başlangıç",
    features: ["Gelir/Gider takibi", "3 kategori limiti", "Manuel veri girişi"],
    action: "Başla",
    tone: "muted",
  },
  {
    name: "Standart",
    monthly: 49,
    note: "Popüler",
    features: ["Sınırsız kategori", "Banka entegrasyonu", "Detaylı raporlar"],
    action: "Standart'ı Seç",
    tone: "standard",
  },
  {
    name: "Premium",
    monthly: 149,
    note: "En İyi Değer",
    features: ["AI Finansal Koç", "Otomatik bütçe risk analizi", "Sınırsız hedef", "Öncelikli destek"],
    action: "Premium'a Geç",
    tone: "premium",
  },
]

export default function LandingPage({ onLogin, onSignup }) {
  const [billing, setBilling] = useState("yearly")
  const yearly = billing === "yearly"

  const planPrice = (monthly) => `₺${yearly ? Math.round(monthly * 0.8) : monthly}`

  return (
    <div className="public-page" style={{ fontFamily: FONT_BODY }}>
      <nav className="public-nav">
        <button className="public-brand" onClick={onSignup} type="button" aria-label="BudgetFlow">
          <span className="public-brand-mark">BF</span>
          <span>BudgetFlow</span>
        </button>
        <div className="public-nav-links" aria-label="Tanıtım menüsü">
          <a href="#features">Özellikler</a>
          <a href="#insights">Çözümler</a>
          <a href="#plans">Planlar</a>
          <a href="#security">Güvenlik</a>
          <a href="#contact">Kaynaklar</a>
        </div>
        <div className="public-nav-actions">
          <button onClick={onLogin} type="button" className="public-link-button">
            Giriş Yap
          </button>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "10px 20px" }}>
            Hemen Başla
          </button>
        </div>
      </nav>

      <main className="public-main">
        <section className="landing-hero">
          <div className="landing-kicker">
            <span>✦</span>
            Yeni: AI Finans Koçu v2.0 Yayında
          </div>
          <h1>
            Finansal Özgürlüğünüzü <span>Tasarlayın</span>
          </h1>
          <p>
            Gelir ve giderlerinizi yüksek netlikle takip edin, hedeflerinize daha hızlı ulaşmak için kişiselleştirilmiş finansal stratejiler oluşturun.
          </p>
          <div className="landing-actions">
            <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "15px 28px", fontSize: 15 }}>
              Hemen Başlayın →
            </button>
            <button onClick={onLogin} type="button" style={{ ...btnGhost, padding: "15px 28px", fontSize: 15 }}>
              Giriş Yap
            </button>
          </div>

          <div className="landing-bento" aria-label="BudgetFlow uygulama önizlemesi">
            <div className="landing-preview glass-card">
              <div className="preview-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-chart">
                {[26, 34, 42, 36, 52, 66, 58, 74, 88].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
                <svg viewBox="0 0 460 240" role="img" aria-label="Yükselen portföy grafiği">
                  <path d="M35 188 C110 172 128 138 184 150 C242 164 258 90 316 104 C368 114 388 62 426 48" />
                </svg>
              </div>
              <div className="preview-copy">
                <div>Canlı Veri Analizi</div>
                <strong>Portföyünüzü Gerçek Zamanlı İzleyin</strong>
              </div>
            </div>

            <div className="landing-side">
              <div className="glass-card landing-mini-card">
                <div className="mini-icon">₺</div>
                <div className="finance-number" style={{ fontFamily: FONT_MONO }}>₺42.500,00</div>
                <span>Aylık Tasarruf Hedefi</span>
                <div className="mini-progress"><i /></div>
              </div>
              <div className="glass-card landing-ai-card">
                <div className="ai-wave" />
                <strong>AI Koçu</strong>
                <span>Harcamalarınızı optimize eden akıllı algoritmalar.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-section-head">
            <div>
              <h2>Finansal Geleceğiniz İçin Akıllı Araçlar</h2>
              <p>Karmaşık finansal verileri akışkan ve berrak bir deneyime dönüştürüyoruz.</p>
            </div>
            <div className="landing-arrow-set" aria-hidden="true">
              <span>‹</span>
              <span>›</span>
            </div>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="glass-card feature-card" key={feature.title}>
                <div style={{ color: feature.color, background: `${feature.color}18` }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card landing-stats" id="security">
          {[
            ["500K+", "Aktif Kullanıcı", S.text],
            ["₺12B+", "Yönetilen Varlık", S.green],
            ["%99.9", "Güvenlik Skoru", S.text],
            ["4.9/5", "App Store Puanı", S.cyan],
          ].map(([value, label, color]) => (
            <div key={label}>
              <strong className="finance-number" style={{ color }}>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="landing-section landing-pricing" id="plans">
          <div className="landing-pricing-head">
            <span>BudgetFlow Plans</span>
            <h2>Planınızı Seçin</h2>
            <p>Size en uygun bütçe yönetimi deneyimini seçin. İstersen ücretsiz başlayın, ihtiyaç büyüdükçe daha güçlü araçlara geçin.</p>
            <div className="landing-billing-pill" role="group" aria-label="Faturalandırma dönemi">
              <button
                type="button"
                className={billing === "monthly" ? "is-active" : ""}
                onClick={() => setBilling("monthly")}
              >
                Aylık
              </button>
              <button
                type="button"
                className={billing === "yearly" ? "is-active" : ""}
                onClick={() => setBilling("yearly")}
              >
                Yıllık <small>-%20</small>
              </button>
            </div>
          </div>

          <div className="landing-plan-grid">
            {plans.map((plan) => (
              <article className={`glass-card landing-plan-card is-${plan.tone}`} key={plan.name}>
                {plan.tone !== "muted" && <div className="landing-plan-badge">{plan.note}</div>}
                <div className="landing-plan-top">
                  <h3>{plan.name}</h3>
                  <div>
                    <strong className="finance-number">{planPrice(plan.monthly)}</strong>
                    <span>/ay</span>
                  </div>
                  {yearly && plan.monthly > 0 && (
                    <small>Yıllık ödemede ₺{Math.round(plan.monthly * 12 * 0.2)} tasarruf</small>
                  )}
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><span>✓</span>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onSignup}
                  className={plan.tone === "premium" ? "landing-plan-primary" : "landing-plan-secondary"}
                >
                  {plan.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-insight" id="insights">
          <div className="glass-card landing-transactions">
            <div className="transactions-title">
              <strong>Son İşlemler</strong>
              <span>≡</span>
            </div>
            {transactions.map((item) => (
              <div className="landing-tx-row" key={item.name}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.meta}</small>
                </div>
                <b className="finance-number" style={{ color: item.tone }}>{item.amount}</b>
              </div>
            ))}
          </div>
          <div>
            <span className="landing-label">Kontrol Sizin Elinizde</span>
            <h2>Her Kuruşun Hikayesini <span>Görün</span></h2>
            <p>
              Gelişmiş kategorizasyon sayesinde harcamalarınız okunabilir hale gelir. Paranızı nereye harcadığınızı değil, nereye yönlendireceğinizi düşünün.
            </p>
            <ul>
              <li>Otomatik banka entegrasyonu</li>
              <li>Kişiselleştirilmiş bütçe limitleri</li>
              <li>Anlık harcama bildirimleri</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="public-footer" id="contact">
        <div>
          <strong>BudgetFlow</strong>
          <span>© 2026 BudgetFlow. Private Wealth Management Systems.</span>
        </div>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}
