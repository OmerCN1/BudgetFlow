const CACHE_KEY = "bf_fx_rates"
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export const SUPPORTED_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "CHF", "JPY", "SAR", "AED"]

export const CURRENCY_LABELS = {
  TRY: "₺ Türk Lirası",
  USD: "$ Amerikan Doları",
  EUR: "€ Euro",
  GBP: "£ İngiliz Sterlini",
  CHF: "₣ İsviçre Frangı",
  JPY: "¥ Japon Yeni",
  SAR: "﷼ Suudi Riyali",
  AED: "د.إ Dirhem",
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

// Convert amount from sourceCurrency to TRY
export function toTRY(amount, fromCurrency, rates) {
  if (!fromCurrency || fromCurrency === "TRY") return amount
  const rate = rates?.[fromCurrency] ?? 1
  return amount * rate
}

// Convert TRY to target currency
export function fromTRY(amount, toCurrency, rates) {
  if (!toCurrency || toCurrency === "TRY") return amount
  const rate = rates?.[toCurrency] ?? 1
  return amount / rate
}

export function formatForeign(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency
  const decimals = currency === "JPY" ? 0 : 2
  return `${sym}${amount.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}
