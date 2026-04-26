---
name: Luminous Wealth
colors:
  surface: "#0e1511"
  surface-dim: "#0e1511"
  surface-bright: "#343b36"
  surface-container-lowest: "#09100c"
  surface-container-low: "#161d19"
  surface-container: "#1a211d"
  surface-container-high: "#242c27"
  surface-container-highest: "#2f3632"
  on-surface: "#dde4dd"
  on-surface-variant: "#bbcabf"
  inverse-surface: "#dde4dd"
  inverse-on-surface: "#2b322d"
  outline: "#86948a"
  outline-variant: "#3c4a42"
  surface-tint: "#4edea3"
  primary: "#4edea3"
  on-primary: "#003824"
  primary-container: "#10b981"
  on-primary-container: "#00422b"
  inverse-primary: "#006c49"
  secondary: "#4cd7f6"
  on-secondary: "#003640"
  secondary-container: "#03b5d3"
  on-secondary-container: "#00424e"
  tertiary: "#ffb3af"
  on-tertiary: "#650911"
  tertiary-container: "#fc7c78"
  on-tertiary-container: "#711419"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#6ffbbe"
  primary-fixed-dim: "#4edea3"
  on-primary-fixed: "#002113"
  on-primary-fixed-variant: "#005236"
  secondary-fixed: "#acedff"
  secondary-fixed-dim: "#4cd7f6"
  on-secondary-fixed: "#001f26"
  on-secondary-fixed-variant: "#004e5c"
  tertiary-fixed: "#ffdad7"
  tertiary-fixed-dim: "#ffb3af"
  on-tertiary-fixed: "#410005"
  on-tertiary-fixed-variant: "#842225"
  background: "#0e1511"
  on-background: "#dde4dd"
  surface-variant: "#2f3632"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  headline-h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.2"
  headline-h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-main:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: "600"
    lineHeight: "1"
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: "500"
    lineHeight: "1"
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

Bu tasarım sistemi, 2026'nın yüksek segment finans dünyası için "Sessiz Lüks" (Quiet Luxury) felsefesini dijital arayüze taşır. Kullanıcıda güven, mutlak kontrol ve prestij hissi uyandırmak üzere kurgulanmıştır.

Görsel dil, **Glassmorphism**'in şeffaflığı ile **Dark-Neumorphism**'in fiziksel derinliğini harmanlar. Yüzeyler sadece birer renk katmanı değil, derinliği olan cam levhalar hissi verir. Arka planda kullanılan ince ızgara (grid) dokuları ve yumuşak radyal ışımalar, boşlukta süzülme hissi yaratarak veriye odaklanmayı kolaylaştırır. Tasarım dili, karmaşık finansal verileri "akışkan" ve "berrak" bir deneyime dönüştürmeyi amaçlar.

## Renk Paleti

Renk kullanımı, karanlık bir evrende yol gösteren navigasyon ışıkları gibi stratejik olarak kurgulanmıştır.

- **Arka Plan:** Derin lacivert-siyah (#05090d), sonsuz derinlik algısı sağlar.
- **Birincil (Zümrüt Yeşil):** Büyümeyi, pozitif nakit akışını ve ana etkileşim noktalarını temsil eder.
- **İkincil (Siyan):** Tasarrufları, yatırımları ve yardımcı metrikleri vurgular.
- **Vurgu Renkleri:** Giderler için Gül Kırmızısı (#f43f5e) ve kritik uyarılar için Kehribar (#f59e0b) kullanılarak hiyerarşi korunur.
- **Lüminesans:** Tüm renkler, karanlık zemin üzerinde kendi ışığını yayan (self-illuminating) bir doygunluğa sahiptir.

## Tipografi

Tipografi sistemi iki ana koldan ilerler: Duygusal etkileşim için **Plus Jakarta Sans**, teknik doğruluk ve okunabilirlik için **JetBrains Mono**.

Tüm finansal rakamlar, bakiye bilgileri ve yüzdelik değişimler JetBrains Mono ile sunulmalıdır; bu, rakamların alt alta diziliminde hizalamayı korur ve teknik bir "fintech" estetiği sağlar. Metin hiyerarşisinde `label-caps` kullanımı, kategori isimlerini ve küçük başlıkları otoriter bir dille ayırır. Türkçe karakter desteği ve "ı, i, ğ" gibi harflerin okunabilirliği için satır arası boşluklar (line-height) cömert tutulmuştur.

## Yerleşim ve Boşluk

Bu tasarım sistemi 8px tabanlı bir grid yapısı kullanır. Yerleşim felsefesi "Havadar ve Odaklı" (Airy & Focused) olarak tanımlanır.

- **Izgara Yapısı:** Masaüstü için 12 sütunlu fluid grid, mobil için 4 sütunlu yapı kullanılır.
- **Margin & Gutter:** Kenar boşlukları ve eleman arası mesafeler geniş tutularak premium hissi pekiştirilir.
- **Ritm:** Dikey ritimde `md` (24px) ve `lg` (48px) birimleri ana bölümleri ayırmak için standarttır. Bilgi yoğunluğu olan tablolarda `xs` ve `sm` birimleri tercih edilir.

## Derinlik ve Katmanlar

Tasarım sistemi, derinliği gölge yerine **ışık ve geçirgenlik** üzerinden kurgular.

- **Katman 0 (Arka Plan):** #05090d zemin üzerine %3 opaklıkta ince noktadan oluşan grid dokusu.
- **Katman 1 (Kartlar/Yüzeyler):** %4-8 opaklıkta beyaz dolgu, 40px Backdrop Blur ve üstten gelen çok ince (1px) luminous border (ışıklı kenar).
- **Katman 2 (Üst Seviye/Pop-up):** Daha yüksek opaklık ve alt kısımlarda birincil renkten beslenen hafif radyal bir "glow" (ışıma).
- **İç Aydınlatma:** Elemanların içinde, üst kenarda 0.5px kalınlığında %15 beyaz opaklıkta "inner highlight" kullanılarak camın kalınlığı hissettirilir.

## Formlar ve Şekiller

Sistemde kullanılan tüm etkileşimli öğeler ve konteynerlar **8px (0.5rem)** köşe yarıçapına sahiptir.

Bu değer, ne çok keskin ne de çok yuvarlaktır; finansal ciddiyet ile modern yumuşaklık arasındaki mükemmel dengeyi temsil eder.

- **Butonlar:** Tam 8px radius.
- **Input Alanları:** 8px radius.
- **Kartlar:** 8px veya 12px (iç içe geçen yapılarda hiyerarşiyi korumak için).
- **Grafik Çizgileri:** Veri grafiklerinde (Line Chart) kırılma noktaları 4px yuvarlatılarak "akış" hissi desteklenir.

## Bileşenler

Bileşen tasarımı "Işıkla Etkileşim" üzerine kuruludur.

- **Butonlar:** Birincil butonlar zümrüt yeşili degrade dolguya sahiptir ve hover durumunda dışarıya yumuşak bir yeşil ışık yayar. İkincil butonlar sadece ince bir sınıra (border) sahiptir.
- **Giriş Alanları (Inputs):** Odaklanıldığında (focus), kenar çizgisi siyan rengine döner ve alt kısımda çok hafif bir ışık süzmesi belirir. Etiketler (labels) her zaman alanın dışında ve `label-caps` stilindedir.
- **Kartlar (Cards):** "Glass" efekti baskındır. İçerik, arka planı hafifçe kırarak derinlik yaratır. Kartlar üzerinde mouse gezdirildiğinde (hover), kartın köşelerinden bir ışık takibi (border trace) yapılır.
- **Finansal Göstergeler:** Artışlar zümrüt yeşili oklarla, azalışlar gül kırmızısı oklarla gösterilir. Rakamlar her zaman `data-md` veya `data-lg` stilinde JetBrains Mono ile yazılır.
- **Yükleme Durumları (Skeleton):** Statik bir gri yerine, soldan sağa doğru akan hafif bir ışık hüzmesi (shimmer) içeren transparan katmanlar kullanılır.
- **İşlem Listeleri:** Her bir satır, birbirinden ince bir "divider" ile ayrılır. Satır üzerine gelindiğinde zemin rengi hafifçe açılır (%2).
