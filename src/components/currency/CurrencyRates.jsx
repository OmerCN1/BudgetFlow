import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Card from "../ui/Card"
import { S, FONT_BODY, FONT_MONO, inputStyle } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import {
  fetchRates,
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  toTRY,
  fromTRY,
  formatForeign,
} from "../../services/currencyService"

const DISPLAY_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY", "SAR", "AED"]

const RATE_COLORS = {
  USD: "#4cd7f6",
  EUR: "#4edea3",
  GBP: "#f59e0b",
  CHF: "#ffb3af",
  JPY: "#a78bfa",
  SAR: "#34d399",
  AED: "#fb923c",
}

function buildSimulatedHistory(rates) {
  // Simulate 7-day history with ±2% noise around current rate for demo purposes
  const days = 7
  return DISPLAY_CURRENCIES.map((code) => {
    const base = rates[code] || 1
    const points = Array.from({ length: days }, (_, i) => {
      const seed = (code.charCodeAt(0) * 31 + i * 17) % 100
      const noise = (seed / 100 - 0.5) * 0.04
      return {
        day: `G-${days - 1 - i}`,
        value: Math.round(base * (1 + noise) * 100) / 100,
      }
    })
    return { code, points }
  })
}

export default function CurrencyRates() {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [fromAmt, setFromAmt] = useState("1000")
  const [fromCur, setFromCur] = useState("TRY")
  const [toCur, setToCur] = useState("USD")
  const [history, setHistory] = useState([])
  const [selectedChart, setSelectedChart] = useState("USD")

  useEffect(() => {
    setLoading(true)
    fetchRates()
      .then((r) => {
        setRates(r)
        setHistory(buildSimulatedHistory(r))
      })
      .catch(() => setError("Kur verileri yüklenemedi."))
      .finally(() => setLoading(false))
  }, [])

  const convertedAmount = rates
    ? (() => {
        const tryAmt = toTRY(parseFloat(fromAmt) || 0, fromCur, rates)
        return fromTRY(tryAmt, toCur, rates)
      })()
    : 0

  const chartData = history.find((h) => h.code === selectedChart)?.points || []

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Finans</span>
          <h1 className="page-title">Döviz Kurları</h1>
          <p className="page-subtitle">Anlık TRY karşılıkları ve çeviri aracı.</p>
        </div>
        {rates && (
          <span style={{ fontSize: 11, color: S.muted, alignSelf: "flex-end" }}>
            Kaynak: open.er-api.com · 1 saatlik cache
          </span>
        )}
      </div>

      {error && (
        <div style={{ color: S.red, fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {loading ? (
        <div style={{ color: S.muted, fontSize: 13 }}>Kurlar yükleniyor...</div>
      ) : (
        <>
          {/* Rate cards */}
          <div className="fx-rate-grid">
            {DISPLAY_CURRENCIES.map((code) => {
              const rate = rates?.[code] || 0
              return (
                <Card key={code} style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: RATE_COLORS[code] || S.green }}>
                          {CURRENCY_SYMBOLS[code]}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: S.text }}>{code}</span>
                      </div>
                      <div style={{ fontSize: 11, color: S.muted }}>{CURRENCY_LABELS[code]?.replace(/^. /, "") || code}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 16, color: S.text }}>
                        {TRY(rate)}
                      </div>
                      <div style={{ fontSize: 10, color: S.muted }}>1 {code} = ₺{rate.toFixed(2)}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Chart + Converter */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 10 }} className="fx-main-grid">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: S.text }}>7 Günlük Trend (tahmini)</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DISPLAY_CURRENCIES.map((code) => (
                    <button
                      key={code}
                      onClick={() => setSelectedChart(code)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: `1px solid ${selectedChart === code ? RATE_COLORS[code] : S.border}`,
                        background: selectedChart === code ? `${RATE_COLORS[code]}22` : "transparent",
                        color: selectedChart === code ? RATE_COLORS[code] : S.muted,
                        cursor: "pointer",
                        fontSize: 11,
                        fontFamily: FONT_BODY,
                        fontWeight: 700,
                      }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={`${S.border}60`} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_BODY }} />
                  <YAxis
                    tick={{ fill: S.muted, fontSize: 10, fontFamily: FONT_MONO }}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `₺${v.toFixed(0)}`}
                    width={54}
                  />
                  <Tooltip
                    formatter={(v) => [`₺${v.toFixed(2)}`, `1 ${selectedChart}`]}
                    contentStyle={{ background: S.card2, border: `1px solid ${S.border}`, color: S.text, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={RATE_COLORS[selectedChart] || S.green}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ fontSize: 10, color: S.muted, marginTop: 8 }}>
                * Grafik anlık kur etrafında simüle edilmiştir. Gerçek tarihsel veri için premium API gereklidir.
              </p>
            </Card>

            <Card>
              <p style={{ fontWeight: 700, fontSize: 14, color: S.text, marginBottom: 16 }}>Çeviri Aracı</p>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: S.muted, display: "block", marginBottom: 4 }}>Kaynak tutar</label>
                  <input
                    type="number"
                    min="0"
                    value={fromAmt}
                    onChange={(e) => setFromAmt(e.target.value)}
                    style={inputStyle}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: S.muted, display: "block", marginBottom: 4 }}>Kaynak para birimi</label>
                  <select value={fromCur} onChange={(e) => setFromCur(e.target.value)} style={inputStyle}>
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ textAlign: "center", color: S.muted, fontSize: 18, lineHeight: 1 }}>↕</div>
                <div>
                  <label style={{ fontSize: 11, color: S.muted, display: "block", marginBottom: 4 }}>Hedef para birimi</label>
                  <select value={toCur} onChange={(e) => setToCur(e.target.value)} style={inputStyle}>
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    background: `${S.green}12`,
                    border: `1px solid ${S.green}40`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>
                    {fromAmt || "0"} {fromCur} =
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 900, fontSize: 22, color: S.green }}>
                    {toCur === "TRY"
                      ? TRY(convertedAmount)
                      : formatForeign(convertedAmount, toCur)}
                  </div>
                  <div style={{ fontSize: 10, color: S.muted, marginTop: 4 }}>
                    Kur: 1 {fromCur} = {toCur === "TRY"
                      ? TRY(rates?.[fromCur] || 1)
                      : formatForeign(fromTRY(rates?.[fromCur] || 1, toCur, rates), toCur)}
                  </div>
                </div>

                {/* Cross rates table */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: S.muted, marginBottom: 8, fontWeight: 700 }}>Çapraz Kurlar</div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {DISPLAY_CURRENCIES.filter((c) => c !== fromCur).slice(0, 5).map((code) => {
                      const cross = rates ? fromTRY(toTRY(1, fromCur, rates), code, rates) : 0
                      return (
                        <div key={code} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: S.sub }}>1 {fromCur} →</span>
                          <span style={{ fontFamily: FONT_MONO, color: RATE_COLORS[code] || S.text }}>
                            {formatForeign(cross, code)} {code}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
