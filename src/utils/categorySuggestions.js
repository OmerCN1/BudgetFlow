const MERCHANT_RULES = [
  {
    label: "Abonelik / Eğlence",
    keywords: ["spotify", "netflix", "youtube", "disney", "prime", "amazon prime", "exxen", "blutv", "gain", "apple music"],
    categoryHints: ["abonelik", "eglence", "eğlence", "dijital", "müzik", "muzik"],
    paymentMethod: "Dijital",
    tags: ["abonelik"],
  },
  {
    label: "Market",
    keywords: ["migros", "carrefour", "a101", "bim", "sok", "şok", "macrocenter", "file market", "istegelsin", "getir", "yemeksepeti market"],
    categoryHints: ["market", "gıda", "gida", "mutfak", "alışveriş", "alisveris"],
    paymentMethod: "Kart",
    tags: ["market"],
  },
  {
    label: "Ulaşım",
    keywords: ["uber", "bitaksi", "marti", "martı", "metro", "iett", "ulasim", "ulaşım", "akbil", "istanbulkart", "benzin", "shell", "opet", "bp", "petrol"],
    categoryHints: ["ulaşım", "ulasim", "yakıt", "yakit", "benzin", "araba"],
    paymentMethod: "Kart",
    tags: ["ulaşım"],
  },
  {
    label: "Yeme İçme",
    keywords: ["starbucks", "kahve", "coffee", "burger", "mcdonald", "kfc", "dominos", "yemeksepeti", "trendyol yemek", "getir yemek", "restoran"],
    categoryHints: ["yemek", "restoran", "kahve", "dışarı", "disari"],
    paymentMethod: "Kart",
    tags: ["yeme-içme"],
  },
  {
    label: "Fatura",
    keywords: ["turkcell", "vodafone", "turk telekom", "türk telekom", "ttnet", "superonline", "elektrik", "dogalgaz", "doğalgaz", "su faturasi", "su faturası", "igdaş", "igdas"],
    categoryHints: ["fatura", "internet", "telefon", "elektrik", "su", "doğalgaz", "dogalgaz"],
    paymentMethod: "Banka",
    tags: ["fatura"],
  },
  {
    label: "Kira",
    keywords: ["kira", "rent"],
    categoryHints: ["kira", "ev"],
    paymentMethod: "Banka",
    tags: ["kira"],
  },
  {
    label: "Maaş",
    keywords: ["maas", "maaş", "salary", "bordro"],
    categoryHints: ["maaş", "maas", "gelir", "salary"],
    type: "income",
    paymentMethod: "Banka",
    tags: ["maaş"],
  },
]

export function normalizeForMatch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
}

export function suggestCategory({ description = "", cats = [], type = "expense" }) {
  const text = normalizeForMatch(description)
  if (!text || cats.length === 0) return null

  const activeCats = cats.filter((cat) => !cat.isArchived && (type === "income" ? cat.isIncome : !cat.isIncome))
  if (activeCats.length === 0) return null

  const scored = []
  for (const cat of activeCats) {
    const catName = normalizeForMatch(`${cat.name} ${cat.icon || ""}`)
    let score = catName && text.includes(catName) ? 72 : 0
    let matchedRule = null

    for (const rule of MERCHANT_RULES) {
      if (rule.type && rule.type !== type) continue
      const keywordHit = rule.keywords.some((keyword) => text.includes(normalizeForMatch(keyword)))
      if (!keywordHit) continue

      const hintHit = rule.categoryHints.some((hint) => catName.includes(normalizeForMatch(hint)))
      const genericHit = catName.includes(normalizeForMatch(rule.label))
      const nextScore = hintHit || genericHit ? 96 : 0
      if (nextScore > score) {
        score = nextScore
        matchedRule = rule
      }
    }

    if (score > 0) scored.push({ cat, score, rule: matchedRule })
  }

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  if (!best || best.score < 55) return null

  return {
    cat: best.cat,
    confidence: best.score,
    label: best.rule?.label || best.cat.name,
    paymentMethod: best.rule?.paymentMethod,
    tags: best.rule?.tags || [],
  }
}

export function extractReceiptFieldsFromText(text) {
  const source = String(text || "")
  const normalized = normalizeForMatch(source)
  const amountCandidates = [...source.matchAll(/(?:toplam|total|tutar|amount|genel toplam)?\s*[:=]?\s*(?:₺|tl|try)?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2})/gi)]
    .map((match) => parseReceiptAmount(match[1]))
    .filter((amount) => amount > 0)

  const dateMatch = source.match(/(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/) || source.match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/)
  const merchant = normalized
    .split(/[_\-\s]+/)
    .find((part) => part.length >= 3 && !/^\d+$/.test(part))

  return {
    merchant: merchant ? titleCase(merchant) : "",
    amount: amountCandidates.length ? Math.max(...amountCandidates) : 0,
    date: dateMatch ? normalizeDateMatch(dateMatch) : "",
  }
}

function parseReceiptAmount(value) {
  const raw = String(value || "")
  const cleaned = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw
  const amount = parseFloat(cleaned)
  return Number.isFinite(amount) ? amount : 0
}

function normalizeDateMatch(match) {
  if (!match) return ""
  if (match[1]?.length === 4) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
  }
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .map((part) => part ? `${part[0].toLocaleUpperCase("tr-TR")}${part.slice(1)}` : "")
    .join(" ")
}
