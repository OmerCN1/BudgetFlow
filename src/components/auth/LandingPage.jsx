import { useState, useEffect, useRef } from "react"
import { S, FONT_BODY, FONT_MONO, btnPrimary, btnGhost } from "../../constants/theme"

const BRAND_LOGO_LIGHT_SRC = "/assets/ba_logo_black.svg"
const BRAND_LOGO_DARK_SRC = "/assets/ba_logo_white.svg"

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
}

const IconIncomeExpense = () => (
  <svg {...iconProps}>
    <path d="M4 18V6" />
    <path d="M4 18h16" />
    <path d="m7 14 3-3 3 2 5-6" />
    <path d="M15 7h3v3" />
  </svg>
)

const IconAiCoach = () => (
  <svg {...iconProps}>
    <path d="M12 3v3" />
    <path d="M5 12H3" />
    <path d="M21 12h-2" />
    <rect x="6" y="7" width="12" height="12" rx="4" />
    <path d="M9.5 12h.01" />
    <path d="M14.5 12h.01" />
    <path d="M9.5 15.5h5" />
  </svg>
)

const IconReports = () => (
  <svg {...iconProps}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <rect x="7" y="11" width="3" height="5" rx="1" />
    <rect x="12" y="7" width="3" height="9" rx="1" />
    <rect x="17" y="9" width="3" height="7" rx="1" />
  </svg>
)

const IconCreditCard = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
    <path d="M15 15h2" />
  </svg>
)

const IconDebt = () => (
  <svg {...iconProps}>
    <path d="M7 8h10" />
    <path d="M7 12h7" />
    <path d="M7 16h5" />
    <path d="M18 14l2 2-2 2" />
    <path d="M20 16h-5" />
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
)

const IconAssets = () => (
  <svg {...iconProps}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9h12v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
)

const IconRecurring = () => (
  <svg {...iconProps}>
    <path d="M17 2v5h-5" />
    <path d="M7 22v-5h5" />
    <path d="M20 11a8 8 0 0 0-13.6-5.6L4 8" />
    <path d="M4 13a8 8 0 0 0 13.6 5.6L20 16" />
  </svg>
)

const IconGoals = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <path d="m16 8 3-3" />
    <path d="M19 5h2" />
    <path d="M19 5V3" />
  </svg>
)

const IconReceipts = () => (
  <svg {...iconProps}>
    <path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3z" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
    <path d="M9 16h3" />
  </svg>
)

const IconConnect = () => (
  <svg {...iconProps}>
    <rect x="3" y="6" width="18" height="12" rx="3" />
    <path d="M7 10h6" />
    <path d="M7 14h3" />
    <path d="M16 10l2 2-2 2" />
  </svg>
)

const IconTrack = () => (
  <svg {...iconProps}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M7 15h2" />
    <path d="M11 12h2" />
    <path d="M15 8h2" />
  </svg>
)

const IconShield = () => (
  <svg {...iconProps}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IconLock = () => (
  <svg {...iconProps}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

const IconControl = () => (
  <svg {...iconProps}>
    <path d="M4 7h10" />
    <path d="M4 17h10" />
    <circle cx="17" cy="7" r="3" />
    <circle cx="17" cy="17" r="3" />
  </svg>
)

const IconSupport = () => (
  <svg {...iconProps}>
    <path d="M4 12a8 8 0 0 1 16 0" />
    <path d="M4 12v3a2 2 0 0 0 2 2h1v-5H4z" />
    <path d="M20 12v3a2 2 0 0 1-2 2h-1v-5h3z" />
    <path d="M13 19h2a3 3 0 0 0 3-3" />
  </svg>
)

const FEATURES = [
  {
    Icon: IconIncomeExpense,
    color: S.green,
    title: "Gelir & Gider Takibi",
    desc: "Tüm işlemlerinizi otomatik kategorize edin. Gerçek zamanlı bakiye ve nakit akışı görünümüyle her zaman bir adım önde olun.",
    tag: "Temel",
  },
  {
    Icon: IconAiCoach,
    color: S.cyan,
    title: "AI Finansal Koç",
    desc: "Kişisel harcama alışkanlıklarınızı öğrenen yapay zeka, size özel tasarruf önerileri ve risk uyarıları sunar.",
    tag: "Premium",
    highlight: true,
  },
  {
    Icon: IconReports,
    color: S.green,
    title: "Detaylı Raporlar",
    desc: "Aylık trendler, kategori dağılımı ve nakit akışı grafikleriyle finansal durumunuzu net görün.",
    tag: "Standart",
  },
  {
    Icon: IconCreditCard,
    color: S.cyan,
    title: "Kredi Kartı Takibi",
    desc: "Birden fazla kredi kartınızı tek ekranda yönetin. Limit kullanımı, ekstre tarihleri ve borç durumunu takip edin.",
    tag: "Yeni",
    new: true,
  },
  {
    Icon: IconDebt,
    color: S.green,
    title: "Borç Yönetimi",
    desc: "Verdiğiniz ve aldığınız borçları takip edin. Otomatik hatırlatmalar ve ödeme planlamasıyla hiçbir borcu kaçırmayın.",
    tag: "Yeni",
    new: true,
  },
  {
    Icon: IconAssets,
    color: S.cyan,
    title: "Varlık Takibi",
    desc: "Gayrimenkul, araç, yatırım ve diğer varlıklarınızı tek platformda izleyin. Net değerinizi her an bilin.",
    tag: "Yeni",
    new: true,
  },
  {
    Icon: IconRecurring,
    color: S.green,
    title: "Tekrarlayan İşlemler",
    desc: "Kira, fatura, abonelik gibi düzenli ödemelerinizi otomatikleştirin. Hiçbir ödemeyi kaçırmazsınız.",
    tag: "Standart",
  },
  {
    Icon: IconGoals,
    color: S.cyan,
    title: "Hedef & Birikim",
    desc: "Finansal hedeflerinizi belirleyin, ilerlemenizi takip edin. Tatil, araba, ev — her hayalinizi planlayın.",
    tag: "Standart",
  },
  {
    Icon: IconReceipts,
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
  {
    text: "Fiş tarama özelliği muhasebe işimi ciddi şekilde rahatlattı. Harcamalarım artık kategorilere otomatik düşüyor.",
    name: "Kerem B.",
    role: "Kafe İşletmecisi",
    avatar: "KB",
  },
  {
    text: "Varlık ve borçlarımı aynı panelde görmek finansal durumumu çok daha net anlamamı sağladı.",
    name: "Selin A.",
    role: "Ürün Yöneticisi",
    avatar: "SA",
  },
  {
    text: "Hedef takibi sayesinde tatil bütçemi ilk kez dağılmadan tamamladım. Uyarılar tam zamanında geliyor.",
    name: "Tolga E.",
    role: "Tasarımcı",
    avatar: "TE",
  },
  {
    text: "Kredi kartı limitleri ve ekstre tarihleri tek ekranda olunca ay sonu sürprizleri bitti.",
    name: "Derya N.",
    role: "Satış Müdürü",
    avatar: "DN",
  },
  {
    text: "AI koçun abonelik önerileriyle kullanmadığım servisleri temizledim. İlk haftadan fark ettirdi.",
    name: "Mert Y.",
    role: "Serbest Çalışan",
    avatar: "MY",
  },
]

const HOW_IT_WORKS = [
  {
    Icon: IconConnect,
    step: "01",
    title: "Bağla",
    desc: "Hesabınızı oluşturun, gelir-gider kategorilerinizi ve ilk finansal hedeflerinizi dakikalar içinde tanımlayın.",
    stat: "3 dk",
  },
  {
    Icon: IconTrack,
    step: "02",
    title: "Takip Et",
    desc: "Varlık, borç, kart limiti ve tekrar eden ödemeleri tek panelde canlı bir finans akışına dönüştürün.",
    stat: "Tek panel",
  },
  {
    Icon: IconAiCoach,
    step: "03",
    title: "AI Öneri Al",
    desc: "AI koç harcama alışkanlıklarınızı analiz eder, tasarruf fırsatlarını ve riskleri anlaşılır önerilere çevirir.",
    stat: "%23 tasarruf",
  },
]

const SECURITY_POINTS = [
  {
    Icon: IconLock,
    title: "Şifreli altyapı",
    desc: "Hassas oturum ve veri akışları modern güvenlik pratikleriyle korunur.",
  },
  {
    Icon: IconControl,
    title: "Veri kontrolü sizde",
    desc: "Hesap, işlem ve arşiv verilerinizi istediğiniz zaman yönetebilirsiniz.",
  },
  {
    Icon: IconShield,
    title: "Güvenli finans deneyimi",
    desc: "Gizlilik, erişim ve hesap güvenliği landing akışının merkezinde tutulur.",
  },
  {
    Icon: IconSupport,
    title: "Destek hazır",
    desc: "Kurulum, güvenlik veya hesap sorularında iletişim kanalları açık kalır.",
  },
]

const FAQS = [
  {
    q: "Ücretsiz planla başlayabilir miyim?",
    a: "Evet. Temel gelir-gider takibiyle başlayabilir, ihtiyaçlarınız arttığında Standart veya Premium plana geçebilirsiniz.",
  },
  {
    q: "Kredi kartı bilgilerim gerekiyor mu?",
    a: "Ücretsiz hesap oluşturmak için kredi kartı gerekmez. Plan seçimini daha sonra yapabilirsiniz.",
  },
  {
    q: "AI koç neyi analiz eder?",
    a: "Harcama eğilimlerinizi, aboneliklerinizi, bütçe risklerini ve tasarruf fırsatlarını anlaşılır önerilere dönüştürür.",
  },
  {
    q: "Verilerimi sonradan yönetebilir miyim?",
    a: "Evet. İşlem, fiş, hedef ve hesap bilgilerinizi panel üzerinden düzenleyebilir veya kaldırabilirsiniz.",
  },
]

const STATS = [
  { value: "500K+", label: "Aktif Kullanıcı", color: S.text },
  { value: "₺12B+", label: "Yönetilen Varlık", color: S.green },
  { value: "%99.9", label: "Güvenlik Skoru", color: S.text },
  { value: "4.9/5", label: "App Store Puanı", color: S.cyan },
]

const HERO_CHART_TREND =
  "M0,72 C0.18,72 0.32,72 0.5,72 C0.84,70 1.16,64 1.5,64 C1.84,64 2.16,56 2.5,56 C2.84,56 3.16,62 3.5,62 C3.84,62 4.16,46 4.5,46 C4.84,46 5.16,38 5.5,38 C5.84,38 6.16,42 6.5,42 C6.84,42 7.16,30 7.5,30 C7.84,30 8.16,20 8.5,20 C8.84,20 9.16,26 9.5,26 C9.84,26 10.16,12 10.5,12 C10.84,12 11.16,4 11.5,4 C11.68,4 11.82,4 12,4"
const HERO_CHART_AREA = `${HERO_CHART_TREND} L12,100 L0,100 Z`
const HERO_TOTAL_AMOUNT = 284750
const formatHeroTotal = (value) => `₺${Math.round(value).toLocaleString("tr-TR")},00`

export default function LandingPage({ onLogin, onSignup, onOpenPage, theme = "dark" }) {
  const [billing, setBilling] = useState("yearly")
  const [activeFeature, setActiveFeature] = useState(0)
  const [heroTotal, setHeroTotal] = useState(0)
  const yearly = billing === "yearly"
  const navRef = useRef(null)
  const brandLogoSrc = theme === "light" ? BRAND_LOGO_LIGHT_SRC : BRAND_LOGO_DARK_SRC
  const activeFeatureData = FEATURES[activeFeature]
  const ActiveFeatureIcon = activeFeatureData.Icon

  const planPrice = (m) => `₺${yearly ? Math.round(m * 0.8) : m}`

  useEffect(() => {
    let frame = 0
    const startTime = performance.now()
    const duration = 2200

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setHeroTotal(HERO_TOTAL_AMOUNT * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
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
          <img className="public-brand-logo" src={brandLogoSrc} alt="BudgetAssist" />
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
              <div className="lp2-hero-3d-stage" aria-hidden="true">
                <div className="lp2-coin-stack-3d">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <b style={{ fontFamily: FONT_MONO }}>₺</b>
                </div>
                <div className="lp2-terminal-3d">
                  <span className="lp2-terminal-screen">
                    <b style={{ fontFamily: FONT_MONO }}>₺18.5K</b>
                    <i />
                  </span>
                  <span className="lp2-terminal-chip" />
                  <span className="lp2-terminal-keypad">
                    <i /><i /><i /><i /><i /><i />
                  </span>
                </div>
                <div className="lp2-card-stack-3d">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="lp2-data-ribbon-3d">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
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
                    <strong
                      className="lp2-dash-total"
                      style={{ fontFamily: FONT_MONO }}
                      aria-label="Toplam varlık 284.750 Türk lirası"
                    >
                      {formatHeroTotal(heroTotal)}
                    </strong>
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
                  <svg viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="lp2ChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4edea3" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      className="lp2-chart-area"
                      d={HERO_CHART_AREA}
                    />
                    <path
                      className="lp2-chart-line"
                      d={HERO_CHART_TREND}
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

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <section className="lp2-how lp-reveal">
          <div className="lp2-section-head">
            <span className="lp2-label">Nasıl Çalışır?</span>
            <h2>Finansal kontrolü<br /><em>3 adımda kurun</em></h2>
            <p>Dağınık işlem, hedef ve ödeme bilgilerini karar alabileceğiniz sade bir akışa çevirin.</p>
          </div>

          <div className="lp2-how-grid">
            {HOW_IT_WORKS.map(({ Icon, step, title, desc, stat }) => (
              <article className="glass-card lp2-how-card" key={title}>
                <span className="lp2-how-step" style={{ fontFamily: FONT_MONO }}>{step}</span>
                <div className="lp2-how-icon">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <strong style={{ fontFamily: FONT_MONO }}>{stat}</strong>
              </article>
            ))}
          </div>
        </section>

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
                    <f.Icon />
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
                color: activeFeatureData.color,
                background: `${activeFeatureData.color}18`,
              }}>
                <ActiveFeatureIcon />
              </div>
              <div className="lp2-feat-detail-tag">
                {activeFeatureData.new && <span className="lp2-new-badge">Yeni</span>}
                <span>{activeFeatureData.tag}</span>
              </div>
              <h3>{activeFeatureData.title}</h3>
              <p>{activeFeatureData.desc}</p>

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
                    {[
                      ["Oca", 82, "₺18K"],
                      ["Şub", 65, "₺14K"],
                      ["Mar", 91, "₺22K"],
                      ["Nis", 74, "₺17K"],
                      ["May", 88, "₺21K"],
                      ["Haz", 96, "₺24K"],
                    ].map(([m, h, value]) => (
                      <div key={m} className="lp2-prev-bar-wrap" style={{ "--bar-height": `${h}%` }}>
                        <span className="lp2-prev-bar-value" style={{ fontFamily: FONT_MONO }}>{value}</span>
                        <div className="lp2-prev-bar-rail">
                          <div className="lp2-prev-bar" />
                        </div>
                        <span className="lp2-prev-month">{m}</span>
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
                style={{ color: activeFeatureData.color, borderColor: `${activeFeatureData.color}40` }}
              >
                {activeFeatureData.title} özelliğini keşfet →
              </button>
            </div>
          </div>
        </section>

        {/* ══ SECURITY STRIP ════════════════════════════════════════════════ */}
        <section className="lp2-security-strip lp-reveal">
          <div className="lp2-security-copy">
            <span className="lp2-label">Güvenlik</span>
            <h2>Finans verileriniz için sakin ve güvenli bir alan.</h2>
            <p>BudgetAssist, kişisel finans verilerinizi anlaşılır kontroller ve güvenli hesap deneyimiyle yönetmeniz için tasarlandı.</p>
            <button type="button" onClick={() => onOpenPage("security")}>
              Güvenlik detaylarını incele →
            </button>
          </div>
          <div className="lp2-security-grid">
            {SECURITY_POINTS.map(({ Icon, title, desc }) => (
              <div className="lp2-security-point" key={title}>
                <span><Icon /></span>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
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
          <div className="lp2-testi-marquee" aria-label="Kullanıcı yorumları">
            <div className="lp2-testi-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <article className="glass-card lp2-testi-card" key={`${t.name}-${i}`} aria-hidden={i >= TESTIMONIALS.length}>
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

        {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
        <section className="lp2-faq lp-reveal">
          <div className="lp2-section-head" style={{ marginBottom: "2rem" }}>
            <span className="lp2-label">Sık Sorulanlar</span>
            <h2>Başlamadan önce<br /><em>aklınızdaki sorular</em></h2>
          </div>
          <div className="lp2-faq-grid">
            {FAQS.map(({ q, a }) => (
              <article className="glass-card lp2-faq-item" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
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
          <img className="public-brand-logo" src={brandLogoSrc} alt="BudgetAssist" />
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
