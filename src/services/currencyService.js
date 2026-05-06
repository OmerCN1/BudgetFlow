const CACHE_KEY = "bf_fx_rates"
const HISTORY_CACHE_KEY = "bf_fx_history"
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const HISTORY_CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

export const SUPPORTED_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "CHF", "JPY", "SAR", "AED"]

export const CURRENCY_FLAGS = {
  TRY: "🇹🇷",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CHF: "🇨🇭",
  JPY: "🇯🇵",
  SAR: "🇸🇦",
  AED: "🇦🇪",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  CNY: "🇨🇳",
  RUB: "🇷🇺",
  QAR: "🇶🇦",
  KWD: "🇰🇼",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  SEK: "🇸🇪",
}

export const CURRENCY_LABELS = {
  TRY: "₺ Türk Lirası",
  USD: "$ Amerikan Doları",
  EUR: "€ Euro",
  GBP: "£ İngiliz Sterlini",
  CHF: "₣ İsviçre Frangı",
  JPY: "¥ Japon Yeni",
  SAR: "﷼ Suudi Riyali",
  AED: "د.إ Dirhem",
  CAD: "C$ Kanada Doları",
  AUD: "A$ Avustralya Doları",
  CNY: "¥ Çin Yuanı",
  RUB: "₽ Rus Rublesi",
  QAR: "﷼ Katar Riyali",
  KWD: "KD Kuveyt Dinarı",
  NOK: "kr Norveç Kronu",
  DKK: "kr Danimarka Kronu",
  SEK: "kr İsveç Kronu",
}

export const CURRENCY_SYMBOLS = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "₣",
  JPY: "¥",
  SAR: "﷼",
  AED: "د.إ",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  RUB: "₽",
  QAR: "﷼",
  KWD: "KD",
  NOK: "kr",
  DKK: "kr",
  SEK: "kr",
}

export function currencyName(code) {
  return CURRENCY_LABELS[code]?.replace(/^[^\s]+ /, "") || code
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { rates, fetchedAt } = JSON.parse(raw)
    if (Date.now() - fetchedAt > CACHE_TTL) return null
    return rates
  } catch {
    return null
  }
}

function writeCache(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }))
  } catch {
    // storage quota — ignore
  }
}

function readHistoryCache(key) {
  try {
    const raw = localStorage.getItem(`${HISTORY_CACHE_KEY}:${key}`)
    if (!raw) return null
    const { data, fetchedAt } = JSON.parse(raw)
    if (Date.now() - fetchedAt > HISTORY_CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function writeHistoryCache(key, data) {
  try {
    localStorage.setItem(`${HISTORY_CACHE_KEY}:${key}`, JSON.stringify({ data, fetchedAt: Date.now() }))
  } catch {
    // storage quota — ignore
  }
}

let _inFlight = null

// Returns rates where each value = how many TRY per 1 unit of that currency
export async function fetchRates() {
  const cached = readCache()
  if (cached) return cached

  if (_inFlight) return _inFlight

  _inFlight = (async () => {
    try {
      // Free tier: https://open.er-api.com/v6/latest/TRY  (base = TRY, rates = how many TRY per 1 foreign unit)
      // Actually open.er-api base TRY → rates[USD] = TRY per 1 USD (inverse of what we want)
      // We request base=USD then invert, or just use base=TRY directly.
      // open.er-api: base TRY means 1 TRY = X foreign. So rates[USD] = how many USD per 1 TRY.
      // We want: how many TRY per 1 foreign. So tryPerUnit[USD] = 1 / rates[USD].
      const res = await fetch("https://open.er-api.com/v6/latest/TRY")
      if (!res.ok) throw new Error("Rate fetch failed")
      const json = await res.json()
      // json.rates[USD] = USD per 1 TRY → invert for TRY per 1 USD
      const tryPerUnit = { TRY: 1 }
      for (const [code, val] of Object.entries(json.rates || {})) {
        if (val > 0) tryPerUnit[code] = 1 / val
      }
      writeCache(tryPerUnit)
      return tryPerUnit
    } catch {
      // Return a rough fallback so UI doesn't break (Apr 2026 approximate)
      const fallback = { TRY: 1, USD: 38.5, EUR: 42.0, GBP: 49.5, CHF: 43.2, JPY: 0.26, SAR: 10.3, AED: 10.5 }
      writeCache(fallback)
      return fallback
    } finally {
      _inFlight = null
    }
  })()

  return _inFlight
}

export async function fetchRateHistory(symbols = SUPPORTED_CURRENCIES.filter((code) => code !== "TRY"), days = 30) {
  const cleanSymbols = [...new Set(symbols.filter((code) => code && code !== "TRY"))]
  if (cleanSymbols.length === 0) return []

  const cacheKey = `${days}:${cleanSymbols.sort().join(",")}`
  const cached = readHistoryCache(cacheKey)
  if (cached) return cached

  const end = isoDate(new Date())
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - Math.max(days + 12, 18))
  const start = isoDate(startDate)
  const data = await Promise.all(cleanSymbols.map(async (code) => {
    try {
      const querySymbols = code === "EUR" ? "TRY" : `TRY,${code}`
      const res = await fetch(`https://api.frankfurter.dev/v1/${start}..${end}?base=EUR&symbols=${querySymbols}`)
      if (!res.ok) throw new Error("Historical rate fetch failed")

      const json = await res.json()
      const points = Object.keys(json.rates || {}).sort().flatMap((date) => {
        const dayRates = json.rates[date] || {}
        const tryPerEur = Number(dayRates.TRY || 0)
        const quotePerEur = code === "EUR" ? 1 : Number(dayRates[code] || 0)
        if (!tryPerEur || !quotePerEur) return []
        return [{
          date,
          day: date.slice(5),
          value: Math.round((tryPerEur / quotePerEur) * 10000) / 10000,
        }]
      })

      return { code, points: points.slice(-days) }
    } catch {
      return { code, points: [] }
    }
  }))
  writeHistoryCache(cacheKey, data)
  return data
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

// Convert amount from sourceCurrency to TRY
export function toTRY(amount, fromCurrency, rates) {
  const n = Number(amount)
  if (!isFinite(n)) return 0
  if (!fromCurrency || fromCurrency === "TRY") return n
  const rate = rates?.[fromCurrency] ?? 1
  return n * rate
}

// Convert TRY to target currency
export function fromTRY(amount, toCurrency, rates) {
  const n = Number(amount)
  if (!isFinite(n)) return 0
  if (!toCurrency || toCurrency === "TRY") return n
  const rate = rates?.[toCurrency] ?? 1
  return rate > 0 ? n / rate : 0
}

export function formatForeign(amount, currency) {
  const n = Number(amount) || 0
  const sym = CURRENCY_SYMBOLS[currency] || currency
  const decimals = currency === "JPY" ? 0 : 2
  return `${sym}${n.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}
