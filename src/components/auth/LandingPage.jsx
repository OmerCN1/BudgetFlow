import { useState, useEffect, useRef } from "react"
import { S, FONT_BODY, FONT_MONO, btnPrimary, btnGhost } from "../../constants/theme"

const BRAND_LOGO_SRC = "/assets/ba_full_png_black.svg"

const FEATURES = [
  {
    icon: "↗",
    color: S.green,
    title: "Gelir & Gider Takibi",
    desc: "Tüm işlemlerinizi otomatik kategorize edin. Gerçek zamanlı bakiye ve nakit akışı görünümüyle her zaman bir adım önde olun.",
    tag: "Temel",
  },
  {
    icon: "✦",
    color: S.cyan,
    title: "AI Finansal Koç",
    desc: "Kişisel harcama alışkanlıklarınızı öğrenen yapay zeka, size özel tasarruf önerileri ve risk uyarıları sunar.",
    tag: "Premium",
    highlight: true,
  },
  {
    icon: "▥",
    color: S.green,
    title: "Detaylı Raporlar",
    desc: "Aylık trendler, kategori dağılımı ve nakit akışı grafikleriyle finansal durumunuzu net görün.",
    tag: "Standart",
  },
  {
    icon: "◈",
    color: S.cyan,
    title: "Kredi Kartı Takibi",
    desc: "Birden fazla kredi kartınızı tek ekranda yönetin. Limit kullanımı, ekstre tarihleri ve borç durumunu takip edin.",
    tag: "Yeni",
    new: true,
  },
  {
    icon: "⊙",
    color: S.green,
    title: "Borç Yönetimi",
    desc: "Verdiğiniz ve aldığınız borçları takip edin. Otomatik hatırlatmalar ve ödeme planlamasıyla hiçbir borcu kaçırmayın.",
    tag: "Yeni",
    new: true,
  },
  {
    icon: "◎",
    color: S.cyan,
    title: "Varlık Takibi",
    desc: "Gayrimenkul, araç, yatırım ve diğer varlıklarınızı tek platformda izleyin. Net değerinizi her an bilin.",
    tag: "Yeni",
    new: true,
  },
  {
    icon: "⟲",
    color: S.green,
    title: "Tekrarlayan İşlemler",
    desc: "Kira, fatura, abonelik gibi düzenli ödemelerinizi otomatikleştirin. Hiçbir ödemeyi kaçırmazsınız.",
    tag: "Standart",
  },
  {
    icon: "◉",
    color: S.cyan,
    title: "Hedef & Birikim",
    desc: "Finansal hedeflerinizi belirleyin, ilerlemenizi takip edin. Tatil, araba, ev — her hayalinizi planlayın.",
    tag: "Standart",
  },
  {
    icon: "⊞",
    color: S.green,
    title: "Fiş & Fatura Arşivi",
    desc: "Kamera ile fişlerinizi tarayın, AI otomatik doldurun. Tüm belgeleriniz bulutta güvende.",
    tag: "Premium",
  },
]

const PLANS = [
  {
    name: "Ücretsiz",
    monthly: 0,
    note: "Başlangıç için",
    features: ["Gelir/Gider takibi", "3 kategori limiti", "Manuel veri girişi", "10 fiş arşivi"],
    action: "Ücretsiz Başla",
    tone: "muted",
  },
  {
    name: "Standart",
    monthly: 49,
    note: "En Popüler",
    features: ["Sınırsız kategori", "Kredi kartı takibi", "Borç & Varlık yönetimi", "Detaylı raporlar", "250 fiş arşivi", "Tekrarlayan işlemler"],
    action: "Standart'ı Seç",
    tone: "standard",
  },
  {
    name: "Premium",
    monthly: 149,
    note: "En İyi Değer",
    features: ["AI Finansal Koç", "Otomatik bütçe risk analizi", "Sınırsız hedef & birikim", "Sınırsız fiş arşivi", "Banka entegrasyonu", "Öncelikli destek"],
    action: "Premium'a Geç",
    tone: "premium",
  },
]

const TESTIMONIALS = [
  {
    text: "Kredi kartı takibi özelliği hayat kurtarıcı. 3 farklı kartımı tek ekranda görüp ekstre tarihlerimi kaçırmıyorum.",
    name: "Zeynep K.",
    role: "Yazılım Geliştirici",
    avatar: "ZK",
  },
  {
    text: "AI koç gerçekten işe yarıyor. İlk ayda aboneliklerimi düzenleyerek ₺640 tasarruf ettim.",
    name: "Mehmet D.",
    role: "Girişimci",
    avatar: "MD",
  },
  {
    text: "Borç takibi sayesinde arkadaşlarımla hesaplaşmak artık çok kolay. Hiçbir şeyi unutmuyorum.",
    name: "Ayşe Ş.",
    role: "Finans Uzmanı",
    avatar: "AŞ",
  },
]

const STATS = [
  { value: "500K+", label: "Aktif Kullanıcı", color: S.text },
  { value: "₺12B+", label: "Yönetilen Varlık", color: S.green },
  { value: "%99.9", label: "Güvenlik Skoru", color: S.text },
  { value: "4.9/5", label: "App Store Puanı", color: S.cyan },
]

export default function LandingPage({ onLogin, onSignup, onOpenPage }) {
  const [billing, setBilling] = useState("yearly")
  const [activeFeature, setActiveFeature] = useState(0)
  const yearly = billing === "yearly"
  const navRef = useRef(null)

  const planPrice = (m) => `₺${yearly ? Math.round(m * 0.8) : m}`

  useEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute("data-theme")
    root.setAttribute("data-theme", "dark")
    return () => {
      if (prev) root.setAttribute("data-theme", prev)
      else root.removeAttribute("data-theme")
    }
  }, [])

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
            const ss = entry.target.querySelectorAll("strong[data-count]")
            const defs = [
              [ss[0], 500, "", "K+", false],
              [ss[1], 12, "₺", "B+", false],
              [ss[2], 99, "%", ".9", false],
              [ss[3], 4.9, "", "/5", true],
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
    <div className="public-page lp2-page" style={{ fontFamily: FONT_BODY }}>

      {/* ── NAV ── */}
      <nav className="public-nav lp2-nav" ref={navRef}>
        <button className="public-brand" onClick={onSignup} type="button" aria-label="BudgetAssist">
          <img className="public-brand-logo" src={BRAND_LOGO_SRC} alt="BudgetAssist" />
        </button>
        <div className="public-nav-links" aria-label="Navigasyon">
          <a href="#features">Özellikler</a>
          <a href="#plans">Planlar</a>
          <button type="button" onClick={() => onOpenPage("security")}>Güvenlik</button>
          <button type="button" onClick={() => onOpenPage("contact")}>İletişim</button>
        </div>
        <div className="public-nav-actions">
          <button onClick={onLogin} type="button" className="public-link-button">Giriş Yap</button>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "10px 22px" }}>
            Hemen Başla
          </button>
        </div>
      </nav>

      <main>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="lp2-hero">
          <div className="lp2-hero-orb lp2-orb-a" aria-hidden="true" />
          <div className="lp2-hero-orb lp2-orb-b" aria-hidden="true" />
          <div className="lp2-hero-orb lp2-orb-c" aria-hidden="true" />

          <div className="lp2-hero-inner">
            <div className="lp2-hero-text lp-enter">
              <div className="lp2-kicker">
                <span className="lp2-kicker-dot" />
                <span>Yeni: AI Finans Koçu v2.0 · Varlık & Borç Takibi · Kredi Kartı Yönetimi</span>
              </div>

              <h1>
                Paranızı<br />
                <em className="lp2-shimmer">akıllıca</em><br />
                <span>yönetin.</span>
              </h1>

              <p>
                Gelir, gider, borç, varlık ve yatırımlarınızı tek platformda takip edin.
                AI destekli analizlerle finansal hedeflerinize çok daha hızlı ulaşın.
              </p>

              <div className="lp2-hero-actions">
                <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "15px 30px", fontSize: 14 }}>
                  Ücretsiz Başla →
                </button>
                <button onClick={onLogin} type="button" style={{ ...btnGhost, padding: "15px 30px", fontSize: 14 }}>
                  Giriş Yap
                </button>
              </div>

              <div className="lp2-social-proof">
                <div className="lp2-avatars">
                  {["ZK", "MD", "AŞ", "KB", "TE"].map((a) => <span key={a}>{a}</span>)}
                </div>
                <div>
                  <div className="lp2-stars">★★★★★</div>
                  <span>47.000+ kullanıcı · 4.9/5 puan</span>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="lp2-hero-visual lp-enter" style={{ animationDelay: "200ms" }}>
              <div className="lp2-dash glass-card">
                {/* Chrome bar */}
                <div className="lp2-dash-chrome">
                  <span /><span /><span />
                  <span className="lp2-dash-url">budgetassist.app</span>
                </div>

                {/* Top bar */}
                <div className="lp2-dash-topbar">
                  <div>
                    <small>Toplam Varlık</small>
                    <strong style={{ fontFamily: FONT_MONO }}>₺284.750,00</strong>
                  </div>
                  <div className="lp2-dash-delta">
                    <span>↑</span>
                    <span>+%4.8 bu ay</span>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="lp2-dash-chart">
                  {[28, 36, 44, 38, 54, 62, 58, 70, 80, 74, 88, 96].map((h, i) => (
                    <i key={i} style={{ height: `${h}%`, animationDelay: `${600 + i * 60}ms` }} />
                  ))}
                  <svg viewBox="0 0 540 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="lp2ChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4edea3" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      className="lp2-chart-area"
                      d="M20,72 C36,68 50,62 65,59 C80,55 94,70 109,68 C124,60 138,52 153,46 C168,41 182,55 197,52 C212,44 226,38 241,32 C256,27 270,35 285,30 C300,24 314,18 329,14 C344,10 358,16 373,12 C388,8 402,4 417,2 C432,0 456,4 475,6 C494,8 514,10 540,8 L540,100 L20,100 Z"
                    />
                    <path
                      className="lp2-chart-line"
                      d="M20,72 C36,68 50,62 65,59 C80,55 94,70 109,68 C124,60 138,52 153,46 C168,41 182,55 197,52 C212,44 226,38 241,32 C256,27 270,35 285,30 C300,24 314,18 329,14 C344,10 358,16 373,12 C388,8 402,4 417,2 C432,0 456,4 475,6 C494,8 514,10 540,8"
                    />
                  </svg>
                </div>

                {/* Modules row */}
                <div className="lp2-dash-modules">
                  <div className="lp2-dash-mod">
                    <span style={{ color: S.green }}>◈</span>
                    <div>
                      <small>Kredi Kartı</small>
                      <b style={{ fontFamily: FONT_MONO }}>₺12.340</b>
                    </div>
                  </div>
                  <div className="lp2-dash-mod">
                    <span style={{ color: S.cyan }}>⊙</span>
                    <div>
                      <small>Borçlar</small>
                      <b style={{ fontFamily: FONT_MONO }}>₺4.800</b>
                    </div>
                  </div>
                  <div className="lp2-dash-mod">
                    <span style={{ color: S.amber }}>◉</span>
                    <div>
                      <small>Hedef</small>
                      <b style={{ fontFamily: FONT_MONO }}>%68</b>
                    </div>
                  </div>
                  <div className="lp2-dash-mod">
                    <span style={{ color: "#ffb3af" }}>⊞</span>
                    <div>
                      <small>Varlıklar</small>
                      <b style={{ fontFamily: FONT_MONO }}>₺240K</b>
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="lp2-dash-txs">
                  {[
                    { icon: "↗", label: "Maaş", date: "Bugün", amt: "+₺18.500", color: S.green },
                    { icon: "▽", label: "Kira", date: "Dün", amt: "-₺4.200", color: "#ffb3af" },
                    { icon: "▽", label: "Netflix", date: "3 gün önce", amt: "-₺89", color: "#ffb3af" },
                  ].map((tx) => (
                    <div className="lp2-dash-tx" key={tx.label}>
                      <span style={{ color: tx.color, background: `${tx.color}18` }}>{tx.icon}</span>
                      <div>
                        <b>{tx.label}</b>
                        <small>{tx.date}</small>
                      </div>
                      <em style={{ color: tx.color, fontFamily: FONT_MONO }}>{tx.amt}</em>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <div className="lp2-float lp2-float-ai glass-card">
                <div className="lp2-float-ai-head">
                  <span style={{ color: S.green }}>✦</span>
                  <strong>AI Koç</strong>
                </div>
                <p>Bu ay abonelik giderlerini <b style={{ color: S.green }}>%23</b> azaltabilirsiniz.</p>
                <div className="lp2-float-ai-bar">
                  <i style={{ width: "77%" }} />
                </div>
              </div>

              <div className="lp2-float lp2-float-card glass-card">
                <small>Garanti BBVA •••• 4821</small>
                <div className="lp2-float-card-limit">
                  <span>Limit Kullanımı</span>
                  <b style={{ color: S.cyan, fontFamily: FONT_MONO }}>%42</b>
                </div>
                <div className="lp2-float-card-bar">
                  <i style={{ width: "42%", background: S.cyan }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="lp2-scroll-hint" aria-hidden="true">
            <span />
          </div>
        </section>

        {/* ══ LOGOS ═════════════════════════════════════════════════════════ */}
        <div className="lp2-logos lp-reveal">
          <span>Desteklenen finansal kurumlar</span>
          <div className="lp2-logos-row">
            {["Ziraat Bankası", "Garanti BBVA", "İş Bankası", "Yapı Kredi", "Akbank", "Halkbank"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
        <section className="lp2-features" id="features">
          <div className="lp2-section-head lp-reveal">
            <span className="lp2-label">9 Güçlü Özellik</span>
            <h2>Her finansal ihtiyacınız için<br /><em>tek platform</em></h2>
            <p>Sıradan bir bütçe uygulaması değil — tam kapsamlı bir finansal kontrol merkezi.</p>
          </div>

          <div className="lp2-feat-layout lp-reveal">
            {/* Left: feature list */}
            <div className="lp2-feat-list">
              {FEATURES.map((f, i) => (
                <button
                  key={f.title}
                  type="button"
                  className={`lp2-feat-item${activeFeature === i ? " is-active" : ""}`}
                  onClick={() => setActiveFeature(i)}
                >
                  <span className="lp2-feat-icon" style={{ color: f.color, background: `${f.color}18` }}>
                    {f.icon}
                  </span>
                  <div>
                    <div className="lp2-feat-title">
                      {f.title}
                      {f.new && <span className="lp2-new-badge">Yeni</span>}
                    </div>
                    <div className="lp2-feat-tag">{f.tag}</div>
                  </div>
                  <span className="lp2-feat-arrow">›</span>
                </button>
              ))}
            </div>

            {/* Right: feature detail */}
            <div className="lp2-feat-detail glass-card">
              <div className="lp2-feat-detail-icon" style={{
                color: FEATURES[activeFeature].color,
                background: `${FEATURES[activeFeature].color}18`,
              }}>
                {FEATURES[activeFeature].icon}
              </div>
              <div className="lp2-feat-detail-tag">
                {FEATURES[activeFeature].new && <span className="lp2-new-badge">Yeni</span>}
                <span>{FEATURES[activeFeature].tag}</span>
              </div>
              <h3>{FEATURES[activeFeature].title}</h3>
              <p>{FEATURES[activeFeature].desc}</p>

              {/* Visual preview per feature */}
              <div className="lp2-feat-preview">
                {activeFeature === 0 && (
                  <div className="lp2-preview-txs">
                    {[
                      { l: "Maaş Ödemesi", a: "+₺18.500", c: S.green },
                      { l: "Market", a: "-₺420", c: "#ffb3af" },
                      { l: "Elektrik", a: "-₺380", c: "#ffb3af" },
                      { l: "Kira Geliri", a: "+₺6.000", c: S.green },
                    ].map((tx) => (
                      <div className="lp2-prev-tx" key={tx.l}>
                        <span>{tx.l}</span>
                        <b style={{ color: tx.c, fontFamily: FONT_MONO }}>{tx.a}</b>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 1 && (
                  <div className="lp2-preview-ai">
                    <div className="lp2-ai-bubble lp2-ai-bubble-in">
                      <span>✦</span>
                      <p>Bu ay yemek harcamanız %34 arttı. Geçen ay ortalama ₺2.100 harcadınız.</p>
                    </div>
                    <div className="lp2-ai-bubble lp2-ai-bubble-in" style={{ animationDelay: "0.3s" }}>
                      <span>✦</span>
                      <p>Netflix, Spotify ve 3 aboneliğiniz çakışıyor — aylık <b style={{ color: S.green }}>₺340 tasarruf</b> mümkün.</p>
                    </div>
                  </div>
                )}
                {activeFeature === 2 && (
                  <div className="lp2-preview-chart">
                    {[["Oca", 82], ["Şub", 65], ["Mar", 91], ["Nis", 74], ["May", 88], ["Haz", 96]].map(([m, h]) => (
                      <div key={m} className="lp2-prev-bar-wrap">
                        <div className="lp2-prev-bar" style={{ height: `${h}%` }} />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 3 && (
                  <div className="lp2-preview-cards">
                    {[
                      { bank: "Garanti BBVA", no: "•••• 4821", used: 42, color: S.cyan },
                      { bank: "Yapı Kredi", no: "•••• 7392", used: 18, color: S.green },
                    ].map((c) => (
                      <div key={c.bank} className="lp2-prev-card">
                        <div className="lp2-prev-card-top">
                          <span>{c.bank}</span>
                          <small style={{ fontFamily: FONT_MONO }}>{c.no}</small>
                        </div>
                        <div className="lp2-prev-card-bar">
                          <i style={{ width: `${c.used}%`, background: c.color }} />
                        </div>
                        <div className="lp2-prev-card-bottom">
                          <small>Limit kullanımı</small>
                          <b style={{ color: c.color }}>%{c.used}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 4 && (
                  <div className="lp2-preview-debts">
                    {[
                      { name: "Ahmet'e borçlu", amt: "₺1.200", due: "15 Mayıs", c: "#ffb3af" },
                      { name: "Zeynep'ten alacak", amt: "₺850", due: "22 Mayıs", c: S.green },
                      { name: "Kira borcum", amt: "₺4.200", due: "1 Haziran", c: "#ffb3af" },
                    ].map((d) => (
                      <div key={d.name} className="lp2-prev-debt">
                        <div>
                          <b>{d.name}</b>
                          <small>{d.due}</small>
                        </div>
                        <span style={{ color: d.c, fontFamily: FONT_MONO }}>{d.amt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 5 && (
                  <div className="lp2-preview-assets">
                    {[
                      { icon: "⌂", name: "Daire — Kadıköy", val: "₺4.200.000", change: "+%12" },
                      { icon: "◈", name: "Araç — Toyota Corolla", val: "₺980.000", change: "-2%" },
                      { icon: "◉", name: "Hisse Senedi", val: "₺124.500", change: "+%28" },
                    ].map((a) => (
                      <div key={a.name} className="lp2-prev-asset">
                        <span>{a.icon}</span>
                        <div>
                          <b>{a.name}</b>
                          <small style={{ fontFamily: FONT_MONO }}>{a.val}</small>
                        </div>
                        <em style={{ color: a.change.startsWith("+") ? S.green : "#ffb3af" }}>{a.change}</em>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 6 && (
                  <div className="lp2-preview-recurring">
                    {[
                      { name: "Kira", period: "Her ay 1'i", amt: "₺4.200" },
                      { name: "Netflix", period: "Her ay 15'i", amt: "₺89" },
                      { name: "İnternet", period: "Her ay 20'si", amt: "₺320" },
                    ].map((r) => (
                      <div key={r.name} className="lp2-prev-recurring">
                        <div className="lp2-prev-rec-icon">⟲</div>
                        <div>
                          <b>{r.name}</b>
                          <small>{r.period}</small>
                        </div>
                        <span style={{ fontFamily: FONT_MONO }}>{r.amt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 7 && (
                  <div className="lp2-preview-goals">
                    {[
                      { name: "Tatil Fonu", pct: 68, color: S.cyan },
                      { name: "Araba Birikikim", pct: 34, color: S.green },
                      { name: "Acil Durum Fonu", pct: 90, color: S.amber },
                    ].map((g) => (
                      <div key={g.name} className="lp2-prev-goal">
                        <div className="lp2-prev-goal-top">
                          <span>{g.name}</span>
                          <b style={{ color: g.color }}>%{g.pct}</b>
                        </div>
                        <div className="lp2-prev-goal-bar">
                          <i style={{ width: `${g.pct}%`, background: g.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeFeature === 8 && (
                  <div className="lp2-preview-receipts">
                    {[
                      { store: "Migros", date: "3 May", amt: "₺420,50", tag: "Market" },
                      { store: "Şok Market", date: "1 May", amt: "₺188,00", tag: "Market" },
                      { store: "Teknosa", date: "28 Nis", amt: "₺2.499,00", tag: "Elektronik" },
                    ].map((r) => (
                      <div key={r.store} className="lp2-prev-receipt">
                        <div className="lp2-prev-receipt-icon">⊞</div>
                        <div>
                          <b>{r.store}</b>
                          <small>{r.date}</small>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <b style={{ fontFamily: FONT_MONO }}>{r.amt}</b>
                          <small className="lp2-receipt-tag">{r.tag}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onSignup}
                className="lp2-feat-cta"
                style={{ color: FEATURES[activeFeature].color, borderColor: `${FEATURES[activeFeature].color}40` }}
              >
                {FEATURES[activeFeature].title} özelliğini keşfet →
              </button>
            </div>
          </div>
        </section>

        {/* ══ STATS ═════════════════════════════════════════════════════════ */}
        <div className="lp-stats lp2-stats lp-reveal">
          {STATS.map(({ value, label, color }) => (
            <div key={label}>
              <strong data-count className="finance-number" style={{ color }}>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════════ */}
        <section className="lp2-testimonials lp-reveal">
          <div className="lp2-section-head" style={{ marginBottom: "2.5rem" }}>
            <span className="lp2-label">Kullanıcı Yorumları</span>
            <h2>47.000+ kişi zaten kullanıyor</h2>
          </div>
          <div className="lp2-testi-grid">
            {TESTIMONIALS.map((t) => (
              <article className="glass-card lp2-testi-card" key={t.name}>
                <div className="lp2-testi-stars">★★★★★</div>
                <p>"{t.text}"</p>
                <div className="lp2-testi-author">
                  <span className="lp2-testi-avatar">{t.avatar}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ══ PRICING ═══════════════════════════════════════════════════════ */}
        <section className="lp2-pricing lp-reveal" id="plans">
          <div className="lp2-section-head" style={{ marginBottom: "0.5rem" }}>
            <span className="lp2-label">Fiyatlandırma</span>
            <h2>Planınızı seçin</h2>
            <p>Ücretsiz başlayın, ihtiyaç büyüdükçe yükseltin.</p>
          </div>

          <div className="lp2-billing-toggle" role="group" aria-label="Fatura dönemi">
            <button type="button" className={billing === "monthly" ? "is-active" : ""} onClick={() => setBilling("monthly")}>Aylık</button>
            <button type="button" className={billing === "yearly" ? "is-active" : ""} onClick={() => setBilling("yearly")}>
              Yıllık <small>-%20</small>
            </button>
          </div>

          <div className="lp2-plan-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`lp2-plan-card glass-card${plan.tone === "premium" ? " lp2-plan-premium" : ""}${plan.tone === "standard" ? " lp2-plan-standard" : ""}`}
              >
                {plan.tone !== "muted" && (
                  <div className={`lp2-plan-badge${plan.tone === "premium" ? " is-premium" : ""}`}>{plan.note}</div>
                )}
                <h3>{plan.name}</h3>
                <div className="lp2-plan-price">
                  <strong style={{ fontFamily: FONT_MONO }}>{planPrice(plan.monthly)}</strong>
                  <span>/ay</span>
                </div>
                {yearly && plan.monthly > 0 && (
                  <small className="lp2-plan-saving">Yıllık ödemede ₺{Math.round(plan.monthly * 12 * 0.2)} tasarruf</small>
                )}
                <ul className="lp2-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onSignup}
                  className={plan.tone === "premium" ? "lp2-plan-btn-primary" : "lp2-plan-btn-secondary"}
                >
                  {plan.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
        <section className="lp2-cta lp-reveal">
          <div className="lp2-cta-grid" aria-hidden="true" />
          <div className="lp2-cta-glow" aria-hidden="true" />
          <span className="lp2-label" style={{ position: "relative" }}>Başlamak ücretsiz</span>
          <h2 style={{ position: "relative" }}>
            Finansal özgürlüğünüze<br />
            <em>bugün başlayın</em>
          </h2>
          <p style={{ position: "relative" }}>
            Ücretsiz hesap oluşturun, kredi kartı gerekmez.<br />
            İlk 30 gün premium özellikleri ücretsiz deneyin.
          </p>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "17px 40px", fontSize: 15, position: "relative" }}>
            Ücretsiz Hesap Oluştur →
          </button>
          <div className="lp2-cta-features" style={{ position: "relative" }}>
            {["Kredi kartı gerekmez", "30 gün ücretsiz", "İstediğiniz an iptal"].map((f) => (
              <span key={f}><b style={{ color: S.green }}>✓</b> {f}</span>
            ))}
          </div>
        </section>

      </main>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="public-footer lp2-footer">
        <div className="lp2-footer-brand">
          <img className="public-brand-logo" src={BRAND_LOGO_SRC} alt="BudgetAssist" />
          <div>
            <small>© 2026 BudgetAssist. Tüm hakları saklıdır.</small>
          </div>
        </div>
        <div className="lp2-footer-links">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); onOpenPage("privacy") }}>Gizlilik</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); onOpenPage("terms") }}>Kullanım Koşulları</a>
          <a href="#security" onClick={(e) => { e.preventDefault(); onOpenPage("security") }}>Güvenlik</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); onOpenPage("contact") }}>İletişim</a>
        </div>
      </footer>
    </div>
  )
}
