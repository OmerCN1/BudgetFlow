export const INIT_CATS = [
  { id: "c1", name: "Maaş", color: "#4edea3", isIncome: true, budget: 0, icon: "💼" },
  { id: "c2", name: "Ek Gelir", color: "#4cd7f6", isIncome: true, budget: 0, icon: "💰" },
  { id: "c3", name: "Kira", color: "#ffb3af", isIncome: false, budget: 18500, icon: "🏠" },
  { id: "c4", name: "Market", color: "#f59e0b", isIncome: false, budget: 9000, icon: "🛒" },
  { id: "c5", name: "Ulaşım", color: "#acedff", isIncome: false, budget: 2800, icon: "🚌" },
  { id: "c6", name: "Faturalar", color: "#4cd7f6", isIncome: false, budget: 4200, icon: "💡" },
  { id: "c7", name: "Abonelikler", color: "#6ffbbe", isIncome: false, budget: 1800, icon: "📱" },
  { id: "c8", name: "Sosyal", color: "#fc7c78", isIncome: false, budget: 3500, icon: "☕" },
]

export const INIT_TXS = [
  { id: "t1", type: "income", amount: 58000, date: "2025-04-01", cat: "c1", desc: "Nisan maaşı", paymentMethod: "Banka", tags: ["maaş"] },
  { id: "t2", type: "expense", amount: 18500, date: "2025-04-02", cat: "c3", desc: "Nisan kirası", paymentMethod: "Banka", tags: ["sabit"] },
  { id: "t3", type: "expense", amount: 2350, date: "2025-04-04", cat: "c4", desc: "Haftalık market alışverişi", paymentMethod: "Kart", tags: ["market"] },
  { id: "t4", type: "expense", amount: 650, date: "2025-04-05", cat: "c5", desc: "İstanbulkart yükleme", paymentMethod: "Dijital", tags: ["ulaşım"] },
  { id: "t5", type: "expense", amount: 1280, date: "2025-04-08", cat: "c6", desc: "İnternet faturası", paymentMethod: "Banka", tags: ["fatura"] },
  { id: "t6", type: "expense", amount: 229, date: "2025-04-10", cat: "c7", desc: "Netflix", paymentMethod: "Kart", tags: ["abonelik"] },
  { id: "t7", type: "expense", amount: 399, date: "2025-04-12", cat: "c7", desc: "Spotify", paymentMethod: "Kart", tags: ["abonelik"] },
  { id: "t8", type: "expense", amount: 920, date: "2025-04-14", cat: "c8", desc: "Kahve ve yemek", paymentMethod: "Kart", tags: ["sosyal"] },
  { id: "t9", type: "income", amount: 6500, date: "2025-04-18", cat: "c2", desc: "Ek proje ödemesi", paymentMethod: "Banka", tags: ["ek gelir"] },
  { id: "t10", type: "expense", amount: 3100, date: "2025-04-20", cat: "c4", desc: "Aylık temel alışveriş", paymentMethod: "Kart", tags: ["market"] },
  { id: "t11", type: "income", amount: 56000, date: "2025-03-01", cat: "c1", desc: "Mart maaşı", paymentMethod: "Banka", tags: ["maaş"] },
  { id: "t12", type: "expense", amount: 18000, date: "2025-03-02", cat: "c3", desc: "Mart kirası", paymentMethod: "Banka", tags: ["sabit"] },
  { id: "t13", type: "expense", amount: 7600, date: "2025-03-08", cat: "c4", desc: "Mart market toplamı", paymentMethod: "Kart", tags: ["market"] },
  { id: "t14", type: "expense", amount: 3650, date: "2025-03-15", cat: "c6", desc: "Mart faturaları", paymentMethod: "Banka", tags: ["fatura"] },
  { id: "t15", type: "expense", amount: 1220, date: "2025-03-20", cat: "c8", desc: "Arkadaşlarla yemek", paymentMethod: "Kart", tags: ["sosyal"] },
]

export const LEGACY_DEMO_DESCRIPTIONS = [
  "Migros haftalık alışveriş",
  "Nisan kirası",
  "Landing page freelance ödemesi",
  "Elektrik, internet ve doğalgaz",
  "Sinema ve yemek",
  "A101 ve manav alışverişi",
  "Eczane",
  "Netflix, Spotify ve iCloud",
  "Logo tasarım işi",
  "Taksi ve toplu taşıma",
  "Şubat maaşı",
  "Şubat kirası",
  "Market alışverişleri",
  "Sevgililer günü yemeği",
  "Faturalar",
  "Ocak maaşı",
  "Ocak kirası",
  "Market",
  "Ulaşım",
  "Elektrik ve doğalgaz",
  "Aralık maaşı",
  "Aralık kirası",
  "Yılbaşı alışverişi",
  "Kasım maaşı",
  "Kasım kirası",
]

export const LEGACY_RECURRING_RULES = [
  "İnternet ve telefon",
  "Netflix + Spotify",
  "Spor salonu",
]

export const INIT_GOALS = [
  { id: "g1", name: "Acil durum fonu", targetAmount: 120000, currentAmount: 36000, targetDateOffsetMonths: 10, color: "#4edea3" },
  { id: "g2", name: "Yaz tatili", targetAmount: 65000, currentAmount: 18500, targetDateOffsetMonths: 5, color: "#4cd7f6" },
]

export const INIT_GOAL_CONTRIBUTIONS = [
  { id: "gc1", goal: "g1", amount: 12000, dateOffsetDays: -50, note: "Maaştan ayrılan tutar" },
  { id: "gc2", goal: "g1", amount: 12000, dateOffsetDays: -20, note: "Aylık düzenli katkı" },
  { id: "gc3", goal: "g2", amount: 10000, dateOffsetDays: -32, note: "Tatil hesabı" },
  { id: "gc4", goal: "g2", amount: 8500, dateOffsetDays: -8, note: "Ek gelirden ayrıldı" },
]

export const INIT_RECURRING_RULES = [
  { name: "Maaş", type: "income", amount: 58000, cat: "c1", frequency: "monthly", dayOfMonth: 1, desc: "Aylık maaş", paymentMethod: "Banka" },
  { name: "Kira", type: "expense", amount: 18500, cat: "c3", frequency: "monthly", dayOfMonth: 2, desc: "Ev kirası", paymentMethod: "Banka" },
  { name: "İnternet", type: "expense", amount: 1280, cat: "c6", frequency: "monthly", dayOfMonth: 8, desc: "Ev interneti", paymentMethod: "Banka" },
  { name: "Telefon", type: "expense", amount: 620, cat: "c6", frequency: "monthly", dayOfMonth: 12, desc: "Mobil hat", paymentMethod: "Kart" },
  { name: "Netflix", type: "expense", amount: 229, cat: "c7", frequency: "monthly", dayOfMonth: 10, desc: "Netflix aboneliği", paymentMethod: "Kart" },
  { name: "Spotify", type: "expense", amount: 399, cat: "c7", frequency: "monthly", dayOfMonth: 12, desc: "Spotify aboneliği", paymentMethod: "Kart" },
  { name: "Konut sigortası", type: "expense", amount: 950, cat: "c7", frequency: "monthly", dayOfMonth: 20, desc: "Sigorta taksidi", paymentMethod: "Kart" },
]

export const INIT_AI_INSIGHTS = [
  {
    type: "saving",
    title: "Market bütçesi izlenebilir seviyede",
    body: "Bu ay market harcamaları bütçenin yaklaşık yarısında. Haftalık limit korunduğu sürece ay sonu rahat kalır.",
    severity: "success",
  },
  {
    type: "subscription",
    title: "Abonelikler ayrıştırıldı",
    body: "Netflix, Spotify ve sigorta ayrı takip edildiği için küçük kalemlerin yıllık etkisi daha net görünüyor.",
    severity: "info",
  },
]
