import { useEffect, useMemo } from "react"
import { S, FONT_BODY, btnPrimary, btnGhost } from "../../constants/theme"
const BRAND_LOGO_SRC = "/assets/ba_full_png_black.svg"


const PAGES = {
  privacy: {
    label: "Gizlilik Politikası",
    kicker: "Gizlilik",
    title: "Verileriniz sizin kontrolünüzde.",
    summary:
      "BudgetAssist, finansal verilerinizi yalnızca hesabınızdaki deneyimi oluşturmak, güvenliği korumak ve destek taleplerini yanıtlamak için kullanır.",
    stat: "KVKK / GDPR odakli",
    updated: "30 Nisan 2026",
    cards: [
      ["Veri kapsamı", "Profil, işlem, kategori, hedef, fiş ve uygulama kullanım verileri hesabınızla ilişkilendirilir."],
      ["Kullanım amacı", "Bütçe özeti, raporlama, AI analizleri, bildirimler ve destek süreçleri için işlenir."],
      ["Haklarınız", "Veri erişimi, düzeltme, silme ve dışa aktarma taleplerinizi destek ekibimize iletebilirsiniz."],
    ],
    sections: [
      ["Toplanan bilgiler", "Kayıt bilgileriniz, manuel eklediğiniz finansal kayıtlar, yüklediğiniz belgeler ve teknik oturum verileri saklanabilir."],
      ["Paylaşım", "Verileriniz satılmaz. Hizmetin çalışması için gerekli altyapı, kimlik doğrulama ve destek sağlayıcılarıyla sınırlı olarak işlenebilir."],
      ["Saklama", "Hesabınız aktif olduğu sürece veriler korunur. Hesap silme talebinizden sonra yasal zorunluluklar dışındaki kayıtlar temizlenir."],
    ],
  },
  terms: {
    label: "Kullanım Koşulları",
    kicker: "Koşullar",
    title: "Net kurallar, sorunsuz finans takibi.",
    summary:
      "BudgetAssist'i kullanarak hesabınızın güvenliğinden, girdiğiniz verilerin doğruluğundan ve hizmeti yasal amaçlarla kullanmaktan sorumlu olursunuz.",
    stat: "Adil kullanım",
    updated: "30 Nisan 2026",
    cards: [
      ["Hesap", "Hesap bilgilerinizin doğru ve güncel olması, şifrenizin korunması sizin sorumluluğunuzdadır."],
      ["Abonelik", "Ücretli planlar seçilen döneme göre yenilenir; iptal sonrası mevcut dönem sonuna kadar erişim sürer."],
      ["Kullanım", "Hizmet, kişisel veya iş finans takibi içindir; kötüye kullanım ve yetkisiz erişim girişimleri yasaktır."],
    ],
    sections: [
      ["Hizmet kapsamı", "BudgetAssist gelir, gider, hedef, rapor, belge ve AI destekli yorumlama araçları sunar. Finansal kararlar nihai olarak kullanıcıya aittir."],
      ["Plan değişiklikleri", "Özellikler ve fiyatlar önceden duyurularak güncellenebilir. Kritik değişikliklerde kullanıcıya bilgilendirme yapılır."],
      ["Fesih", "Koşullara aykırı kullanımda erişim kısıtlanabilir. Kullanıcı istediği zaman hesabını kapatma talebinde bulunabilir."],
    ],
  },
  security: {
    label: "Güvenlik",
    kicker: "Güvenlik",
    title: "Finansal veriler için sakin ve güçlü koruma.",
    summary:
      "BudgetAssist; kimlik doğrulama, erişim kontrolü, şifrelenmiş iletişim ve düzenli izleme yaklaşımlarıyla hassas verileri korumaya odaklanır.",
    stat: "%99.9 izleme",
    updated: "30 Nisan 2026",
    cards: [
      ["Şifreli trafik", "Tarayıcı ile servisler arasındaki iletişim modern TLS standartlarıyla korunur."],
      ["Erişim kontrolü", "Kullanıcı verileri hesap bazlı yetkilendirme kontrolleriyle ayrılır."],
      ["Operasyonel izleme", "Hata, performans ve güvenlik sinyalleri düzenli olarak takip edilir."],
    ],
    sections: [
      ["Kimlik doğrulama", "Oturum yönetimi ve hesap erişimi Supabase kimlik doğrulama altyapısı üzerinden yürütülür."],
      ["Belge güvenliği", "Yüklenen fiş ve belgeler hesap bağlamında saklanır; paylaşım ve erişim işlemleri yetkilendirme kontrollerinden geçer."],
      ["Sorumlu bildirim", "Güvenlik açığı şüphelerinizi destek kanalından iletin. Öncelikli inceleme ve geri bildirim süreci uygulanır."],
    ],
  },
  contact: {
    label: "İletişim",
    kicker: "İletişim",
    title: "Sorularınız için buradayız.",
    summary:
      "Ürün, hesap, faturalandırma veya güvenlik konularında ekibe ulaşabilirsiniz. Mesajınızı en doğru kanala yönlendirip hızlıca döneriz.",
    stat: "24 saat içinde dönüş",
    updated: "30 Nisan 2026",
    cards: [
      ["Destek", "support@budgetassist.app üzerinden hesap ve ürün yardımı alabilirsiniz."],
      ["Güvenlik", "security@budgetassist.app adresi güvenlik bildirimleri için öncelikli kanaldır."],
      ["İş ortaklığı", "partnerships@budgetassist.app ile entegrasyon ve iş birliği taleplerini paylaşabilirsiniz."],
    ],
    sections: [
      ["Çalışma saatleri", "Hafta içi 09:00-18:00 arasında destek talepleri öncelikli olarak yanıtlanır."],
      ["Yanıta eklenecekler", "Hesap e-postanızı, kısa sorun özetini ve varsa ekran görüntüsünü eklemek süreci hızlandırır."],
      ["Acil konular", "Hesap erişimi veya güvenlik şüphelerinde konu başlığına Acil ibaresi ekleyin."],
    ],
  },
}

const footerPages = ["privacy", "terms", "security", "contact"]

export default function PublicInfoPage({ page = "privacy", onBackLanding, onLogin, onSignup, onOpenPage }) {
  const content = PAGES[page] || PAGES.privacy
  const related = useMemo(() => footerPages.filter((id) => id !== page).slice(0, 3), [page])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  useEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute("data-theme")
    root.setAttribute("data-theme", "dark")
    return () => {
      if (prev) root.setAttribute("data-theme", prev)
      else root.removeAttribute("data-theme")
    }
  }, [])

  const openPage = (event, id) => {
    event.preventDefault()
    onOpenPage(id)
  }

  return (
    <div className="public-page public-info-page" style={{ fontFamily: FONT_BODY }}>
      <nav className="public-nav public-info-nav">
                <button className="public-brand" onClick={onBackLanding} type="button" aria-label="BudgetAssist">
        <img className="public-brand-logo" src={BRAND_LOGO_SRC} alt="BudgetAssist" />
        </button>
        <div className="public-nav-links" aria-label="Bilgi sayfalari">
          {footerPages.map((id) => (
            <a
              href={`#${id}`}
              key={id}
              className={id === page ? "is-active" : ""}
              onClick={(event) => openPage(event, id)}
            >
              {PAGES[id].label}
            </a>
          ))}
        </div>
        <div className="public-nav-actions">
          <button onClick={onLogin} type="button" className="public-link-button">Giriş Yap</button>
          <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "10px 20px" }}>
            Hemen Başla
          </button>
        </div>
      </nav>

      <main className="public-info-main">
        <section className="public-info-hero">
          <div>
            <button type="button" className="public-info-back" onClick={onBackLanding}>
              ← Ana sayfaya dön
            </button>
            <span className="lp-section-label">{content.kicker}</span>
            <h1>{content.label}</h1>
            <p>{content.summary}</p>
          </div>
          <aside className="glass-card public-info-summary">
            <span>Son güncelleme</span>
            <strong>{content.updated}</strong>
            <small>{content.stat}</small>
          </aside>
        </section>

        <section className="public-info-card-grid" aria-label={`${content.label} ozeti`}>
          {content.cards.map(([title, text], index) => (
            <article className="glass-card public-info-card" key={title}>
              <span style={{ color: index === 1 ? S.cyan : S.green }}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="glass-card public-info-detail">
          <div className="public-info-detail-head">
            <span className="lp-section-label">Detaylar</span>
            <h2>{content.title}</h2>
          </div>
          <div className="public-info-section-list">
            {content.sections.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-info-related">
          <div>
            <span className="lp-section-label">Diger sayfalar</span>
            <h2>Merak ettiğiniz başlığı açın.</h2>
          </div>
          <div>
            {related.map((id) => (
              <a href={`#${id}`} key={id} onClick={(event) => openPage(event, id)}>
                {PAGES[id].label}
              </a>
            ))}
          </div>
        </section>

        <section className="public-info-cta">
          <h2>BudgetAssist'i deneyin</h2>
          <p>Finansal kayıtlarınızı daha net takip etmek için ücretsiz hesap oluşturun.</p>
          <div>
            <button onClick={onSignup} type="button" style={{ ...btnPrimary, padding: "14px 24px" }}>
              Ücretsiz Başla
            </button>
            <button onClick={onLogin} type="button" style={{ ...btnGhost, padding: "14px 24px" }}>
              Giriş Yap
            </button>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div>
          <strong>BudgetAssist</strong>
          <span>© 2026 BudgetAssist. Private Wealth Management Systems.</span>
        </div>
        <div>
          {footerPages.map((id) => (
            <a href={`#${id}`} key={id} onClick={(event) => openPage(event, id)}>
              {PAGES[id].label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
