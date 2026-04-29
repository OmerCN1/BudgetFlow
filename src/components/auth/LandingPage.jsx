import { useState, useEffect, useRef } from "react"
import { S, FONT_BODY, FONT_MONO, btnPrimary, btnGhost } from "../../constants/theme"

const dashTxs = [
  { icon: "↗", name: "Maaş Ödemesi",      date: "Dün, 18:00",   amount: "+₺8.500,00", color: S.green },
  { icon: "◻", name: "Market Alışverişi", date: "2 saat önce",  amount: "-₺340,00",   color: S.text  },
  { icon: "◻", name: "Netflix",            date: "7 gün önce",   amount: "-₺89,90",    color: S.text  },
]

const bentoTxs = [
  { name: "Maaş Ödemesi",    amount: "+₺8.500,00", color: S.green },
  { name: "Market Alışveriş", amount: "-₺340,00",   color: S.rose  },
  { name: "Elektrik Faturası",amount: "-₺1.240,00", color: S.rose  },
]

const testimonials = [
  {
    text: "BudgetFlow sayesinde aylık harcamalarımı tam kontrol altına aldım. AI koç özelliği gerçekten fark yaratıyor.",
    name: "Zeynep K.",
    role: "Yazılım Geliştirici",
    avatar: "ZK",
    stars: 5,
  },
  {
    text: "Abonelik ve faturalarımı takip etmek artık çok kolay. Her ay ne kadar tasarruf ettiğimi net görüyorum.",
    name: "Mehmet D.",
    role: "Girişimci",
    avatar: "MD",
    stars: 5,
  },
  {
    text: "Finansal hedeflerime ulaşmak için mükemmel bir araç. Raporlar ve grafikler çok anlaşılır.",
    name: "Ayşe Ş.",
    role: "Finans Uzmanı",
    avatar: "AŞ",
    stars: 5,
  },
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
  const navRef = useRef(null)

  const planPrice = (m) => `₺${yearly ? Math.round(m * 0.8) : m}`

  useEffect(() => {
    const nav = navRef.current
    const onScroll = () => nav?.classList.toggle("is-scrolled", window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })

    const animateCounter = (el, target, prefix, suffix, isFloat) => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / 1600, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = prefix + (isFloat ? (e * target).toFixed(1) : Math.floor(e * target)) + suffix
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          if (entry.target.classList.contains("lp-stats")) {
            const ss = entry.target.querySelectorAll("strong")
            const defs = [
              [ss[0], 500, "",  "K+", false],
              [ss[1], 12,  "₺", "B+", false],
              [ss[2], 99,  "%", ".9", false],
              [ss[3], 4.9, "",  "/5", true ],
            ]
            defs.forEach(([el, ...args]) => el && animateCounter(el, ...args))
          }
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    )

    document.querySelectorAll(".lp-reveal").forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div className="public-page" style={{ fontFamily: FONT_BODY }}>

      {/* ── NAV ───────────────────────────────────────────────────── */}
      <nav className="public-nav" ref={navRef}>
        <button className="public-brand" onClick={onSignup} type="button" aria-label="BudgetFlow">
          <span className="public-brand-mark">BF</span>
          <span>BudgetFlow</span>
        </button>
        <div className="public-nav-links" aria-label="Navigasyon">
          <a href="#features">Özellikler</a>
          <a href="#plans">Planlar</a>
          <a href="#security">Güvenlik</a>
          <a href="#contact">İletişim</a>
        </div>
        <div className="public-nav-actions">
          <button onClick={onLogin} type="button" className="public-link-button">Giriş Yap</button>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "10px 20px" }}>
            Hemen Başla
          </button>
        </div>
      </nav>

      <main className="lp-main">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-orb lp-orb-1" aria-hidden="true" />
          <div className="lp-orb lp-orb-2" aria-hidden="true" />
          <div className="lp-orb lp-orb-3" aria-hidden="true" />

          <div className="lp-hero-inner">

            {/* Left: text */}
            <div className="lp-hero-left">
              <div className="landing-kicker lp-enter" style={{ animationDelay: "0ms" }}>
                <span>✦</span> Yeni: AI Finans Koçu v2.0 Yayında
              </div>

              <h1 className="lp-enter" style={{ animationDelay: "120ms" }}>
                Bütçenizi<br />
                <span className="lp-shimmer-text">Akıllıca</span><br />
                Yönetin
              </h1>

              <p className="lp-enter" style={{ animationDelay: "240ms" }}>
                Gelir, gider ve yatırımlarınızı tek platformda takip edin. AI destekli analizlerle finansal hedeflerinize çok daha hızlı ulaşın.
              </p>

              <div className="lp-hero-cta lp-enter" style={{ animationDelay: "360ms" }}>
                <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "14px 26px", fontSize: 14 }}>
                  Ücretsiz Başla →
                </button>
                <button onClick={onLogin} type="button" style={{ ...btnGhost, padding: "14px 26px", fontSize: 14 }}>
                  Giriş Yap
                </button>
              </div>

              <div className="lp-trust lp-enter" style={{ animationDelay: "480ms" }}>
                <div className="lp-avatars">
                  {["ZK", "MD", "AŞ", "KB"].map((a) => <span key={a}>{a}</span>)}
                </div>
                <span>+47.000 kişi kullanıyor</span>
                <div className="lp-stars">★★★★★ <small>4.9/5</small></div>
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="lp-hero-right lp-enter" style={{ animationDelay: "300ms" }}>
              <div className="lp-dash-mock glass-card">
                <div className="lp-dash-chrome">
                  <span /><span /><span />
                  <span className="lp-dash-chrome-title">BudgetFlow</span>
                </div>

                <div className="lp-dash-balance">
                  <div>
                    <small>Toplam Varlık</small>
                    <strong style={{ fontFamily: FONT_MONO }}>₺284.750,00</strong>
                  </div>
                  <div className="lp-dash-change">
                    <span className="lp-dash-arrow">↑</span>
                    <span>+₺12.400 bu ay</span>
                  </div>
                </div>

                <div className="lp-dash-chart">
                  {[26, 34, 42, 36, 52, 66, 58, 74, 88].map((h, i) => (
                    <i key={i} style={{ height: `${h}%` }} />
                  ))}
                  <svg viewBox="0 0 460 130" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      className="lp-chart-path"
                      d="M53 96 C67 93 80 89 94 86 C108 82 122 78 136 75 C150 72 163 80 177 83 C191 76 205 69 219 62 C233 56 246 50 260 44 C274 40 287 52 301 55 C315 48 329 41 343 34 C357 28 370 22 384 16"
                    />
                  </svg>
                </div>

                <div className="lp-dash-txs">
                  {dashTxs.map((tx) => (
                    <div className="lp-dash-tx" key={tx.name}>
                      <span style={{ color: tx.color, background: `${tx.color}18` }}>{tx.icon}</span>
                      <div>
                        <strong>{tx.name}</strong>
                        <small>{tx.date}</small>
                      </div>
                      <b style={{ color: tx.color, fontFamily: FONT_MONO }}>{tx.amount}</b>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating mini cards */}
              <div className="lp-float-card lp-float-savings glass-card">
                <small>Tasarruf Hedefi</small>
                <strong style={{ fontFamily: FONT_MONO }}>₺42.500</strong>
                <div className="mini-progress"><i /></div>
              </div>
              <div className="lp-float-card lp-float-ai glass-card">
                <span>✦ AI İçgörü</span>
                <p>Bu ay %18 tasarruf potansiyeli</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── LOGOS STRIP ───────────────────────────────────────────── */}
        <div className="lp-logos-strip">
          <span>Desteklenen finansal kurumlar</span>
          <div className="lp-logos-row">
            {["Ziraat Bankası", "Garanti BBVA", "İş Bankası", "Yapı Kredi", "Akbank"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        {/* ── FEATURES BENTO ───────────────────────────────────────── */}
        <section className="lp-features" id="features">
          <div className="lp-section-head lp-reveal">
            <span className="lp-section-label">Özellikler</span>
            <h2>Her şeyi tek platformda yönetin</h2>
            <p>Karmaşık finansal verileri akışkan ve berrak bir deneyime dönüştürüyoruz.</p>
          </div>

          <div className="lp-bento">
            {/* Wide: Akıllı Takip */}
            <article className="glass-card lp-bento-card lp-bento-wide lp-reveal">
              <div className="lp-bento-icon" style={{ color: S.green, background: `${S.green}18` }}>↗</div>
              <h3>Akıllı Takip</h3>
              <p>Gelir, gider ve kategori akışınızı tek bir panelde berrak biçimde yönetin. Gerçek zamanlı verilerle her zaman bir adım önde olun.</p>
              <div className="lp-bento-bars">
                {[35, 52, 44, 68, 60, 76, 82].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="bentoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="lp-bento-chart-area"
                    d="M26,65 C42,56 51,48 67,48 C83,48 93,56 109,56 C125,40 137,32 150,32 C163,32 175,40 191,40 C207,29 220,24 233,24 C249,18 262,18 274,18 L274,100 L26,100 Z"
                  />
                  <path
                    className="lp-bento-chart-path"
                    d="M26,65 C42,56 51,48 67,48 C83,48 93,56 109,56 C125,40 137,32 150,32 C163,32 175,40 191,40 C207,29 220,24 233,24 C249,18 262,18 274,18"
                  />
                </svg>
              </div>
            </article>

            {/* Small: Raporlama */}
            <article className="glass-card lp-bento-card lp-reveal">
              <div className="lp-bento-icon" style={{ color: S.cyan, background: `${S.cyan}18` }}>▥</div>
              <h3>Raporlama</h3>
              <p>Aylık trendleri, bütçe risklerini ve nakit akışını görsel olarak okuyun.</p>
              <div className="lp-bento-report">
                {[60, 80, 45, 90, 70].map((w, i) => (
                  <div key={i} className="lp-report-bar">
                    <div style={{ width: `${w}%`, background: `linear-gradient(90deg, ${S.cyan}55, ${S.cyan})` }} />
                  </div>
                ))}
              </div>
            </article>

            {/* Small: AI Koç */}
            <article className="glass-card lp-bento-card lp-bento-ai-card lp-reveal">
              <div className="ai-wave" aria-hidden="true" />
              <div className="lp-bento-icon" style={{ color: S.green, background: `${S.green}18`, position: "relative", zIndex: 1 }}>✦</div>
              <h3 style={{ position: "relative", zIndex: 1 }}>AI Finans Koçu</h3>
              <p style={{ position: "relative", zIndex: 1 }}>Harcamalarınızı optimize eden kişisel öneriler ve risk analizleri alın.</p>
              <div className="lp-bento-ai-tip" style={{ position: "relative", zIndex: 1 }}>
                <span>✦</span>
                <small>Bu ay abonelik giderlerini %23 azaltabilirsiniz.</small>
              </div>
            </article>

            {/* Wide: İşlemler */}
            <article className="glass-card lp-bento-card lp-bento-wide lp-reveal">
              <div className="lp-bento-icon" style={{ color: S.cyan, background: `${S.cyan}18` }}>≡</div>
              <h3>Anlık İşlem Takibi</h3>
              <p>Tüm banka hesaplarınızdaki işlemleri tek ekranda görün ve kategorize edin.</p>
              <div className="lp-bento-txs">
                {bentoTxs.map((tx) => (
                  <div className="lp-bento-tx" key={tx.name}>
                    <span>{tx.name}</span>
                    <b style={{ color: tx.color, fontFamily: FONT_MONO }}>{tx.amount}</b>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────── */}
        <section className="lp-stats lp-reveal" id="security">
          {[
            ["500K+", "Aktif Kullanıcı",  S.text ],
            ["₺12B+", "Yönetilen Varlık", S.green],
            ["%99.9", "Güvenlik Skoru",   S.text ],
            ["4.9/5", "App Store Puanı",  S.cyan ],
          ].map(([value, label, color]) => (
            <div key={label}>
              <strong className="finance-number" style={{ color }}>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
        <section className="lp-testimonials lp-reveal">
          <div className="lp-section-head" style={{ marginBottom: "2.5rem" }}>
            <span className="lp-section-label">Kullanıcı Yorumları</span>
            <h2>Binlerce kullanıcı güveniyor</h2>
          </div>
          <div className="lp-testi-grid">
            {testimonials.map((t) => (
              <article className="glass-card lp-testi-card" key={t.name}>
                <div className="lp-testi-stars">{"★".repeat(t.stars)}</div>
                <p className="lp-testi-quote">"{t.text}"</p>
                <div className="lp-testi-author">
                  <span className="lp-testi-avatar">{t.avatar}</span>
                  <div>
                    <strong className="lp-testi-name">{t.name}</strong>
                    <small className="lp-testi-role">{t.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────── */}
        <section className="lp-pricing-wrap lp-reveal" id="plans">
          <div className="lp-section-head" style={{ marginBottom: "2.5rem" }}>
            <span className="lp-section-label">Fiyatlandırma</span>
            <h2>Planınızı Seçin</h2>
            <p>Ücretsiz başlayın, ihtiyaç büyüdükçe daha güçlü araçlara geçin.</p>
            <div className="landing-billing-pill" role="group" aria-label="Faturalandırma" style={{ marginTop: "1.5rem" }}>
              <button type="button" className={billing === "monthly" ? "is-active" : ""} onClick={() => setBilling("monthly")}>Aylık</button>
              <button type="button" className={billing === "yearly"  ? "is-active" : ""} onClick={() => setBilling("yearly")}>
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
                  {plan.features.map((f) => (
                    <li key={f}><span>✓</span>{f}</li>
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

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section className="lp-final-cta lp-reveal">
          <div className="lp-cta-glow" aria-hidden="true" />
          <span className="lp-section-label">Başlamak ücretsiz</span>
          <h2>Finansal özgürlüğünüze<br /><span>bugün başlayın</span></h2>
          <p>Ücretsiz hesap oluşturun, kredi kartı gerekmez. İlk 30 gün premium özellikleri ücretsiz deneyin.</p>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "16px 36px", fontSize: 15 }}>
            Ücretsiz Hesap Oluştur →
          </button>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
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
