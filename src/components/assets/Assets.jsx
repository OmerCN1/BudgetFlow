import { useEffect, useMemo, useState } from "react"
import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, inputStyle, btnPrimary, btnGhost, btnDanger } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import { fetchRates, CURRENCY_SYMBOLS, CURRENCY_LABELS } from "../../services/currencyService"

// XAU/XAG: gold-api.com → USD fiyatı; USD/TRY kuru ile çarpılır
// 1 troy ounce = 31.1035 gram
const TROY_TO_GRAM = 31.1035

const GOLD_UNITS = [
  { value: "gram",     label: "Gram Altın",        gramsEach: 1 },
  { value: "quarter",  label: "Çeyrek Altın",       gramsEach: 1.75 },
  { value: "half",     label: "Yarım Altın",        gramsEach: 3.5 },
  { value: "full",     label: "Tam Altın",          gramsEach: 7 },
  { value: "ata",      label: "Ata Altın (5'li)",   gramsEach: 33.7 },
  { value: "republic", label: "Cumhuriyet Altını",  gramsEach: 7.25 },
]

// Kendi döviz listesi — currencyService + ekstralar
const CURRENCY_OPTIONS = [
  { code: "USD", label: "$ Amerikan Doları",    symbol: "$" },
  { code: "EUR", label: "€ Euro",               symbol: "€" },
  { code: "GBP", label: "£ İngiliz Sterlini",   symbol: "£" },
  { code: "CHF", label: "₣ İsviçre Frangı",     symbol: "₣" },
  { code: "JPY", label: "¥ Japon Yeni",         symbol: "¥" },
  { code: "SAR", label: "﷼ Suudi Riyali",       symbol: "﷼" },
  { code: "AED", label: "د.إ Dirhem",           symbol: "د.إ" },
  { code: "CAD", label: "C$ Kanada Doları",      symbol: "C$" },
  { code: "AUD", label: "A$ Avustralya Doları",  symbol: "A$" },
  { code: "CNY", label: "¥ Çin Yuanı",          symbol: "¥" },
  { code: "RUB", label: "₽ Rus Rublesi",        symbol: "₽" },
  { code: "QAR", label: "﷼ Katar Riyali",       symbol: "﷼" },
  { code: "KWD", label: "KD Kuveyt Dinarı",     symbol: "KD" },
]

const ASSET_TYPES = [
  { value: "gold",    label: "Altın",       icon: "🪙" },
  { value: "silver",  label: "Gümüş",       icon: "🥈" },
  { value: "currency",label: "Döviz",       icon: "💵" },
  { value: "bank",    label: "Banka / TRY", icon: "🏦" },
  { value: "other",   label: "Diğer",       icon: "📦" },
]

const emptyForm = {
  name: "",
  assetType: "gold",
  goldUnit: "gram",
  currencyCode: "USD",
  quantity: "",
  unitCost: "",
  note: "",
}

// gold-api.com'dan spot fiyat çek (USD/troy ounce)
async function fetchSpotUSD(symbol) {
  const res = await fetch(`https://api.gold-api.com/price/${symbol}`)
  if (!res.ok) throw new Error("spot fetch failed")
  const json = await res.json()
  return Number(json.price) // USD per troy ounce
}

function useMarketData() {
  const [rates, setRates] = useState(null)   // TRY per 1 foreign unit
  const [goldTRY, setGoldTRY] = useState(null) // TRY per 1 gram altın
  const [silverTRY, setSilverTRY] = useState(null) // TRY per 1 gram gümüş
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [fxRates, xauUSD, xagUSD] = await Promise.all([
          fetchRates(),
          fetchSpotUSD("XAU").catch(() => null),
          fetchSpotUSD("XAG").catch(() => null),
        ])
        if (cancelled) return
        setRates(fxRates)
        const usdTRY = fxRates?.USD ?? 38.5
        if (xauUSD) setGoldTRY((xauUSD * usdTRY) / TROY_TO_GRAM)
        if (xagUSD) setSilverTRY((xagUSD * usdTRY) / TROY_TO_GRAM)
        setLastUpdated(new Date())
      } catch {
        // sessizce yoksay, göstergeler — kalır
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { rates, goldTRY, silverTRY, loading, lastUpdated }
}

function silverGrams(asset) {
  return asset.quantity // gümüş gramı adet olarak tutuyoruz
}

function goldGrams(asset) {
  const unit = GOLD_UNITS.find((u) => u.value === asset.goldUnit)
  return asset.quantity * (unit?.gramsEach ?? 1)
}

function assetValueTRY(asset, rates, goldTRY, silverTRY) {
  switch (asset.assetType) {
    case "gold": {
      if (!goldTRY) return null
      return goldGrams(asset) * goldTRY
    }
    case "silver": {
      if (!silverTRY) return null
      return silverGrams(asset) * silverTRY
    }
    case "currency": {
      if (!rates || !asset.currencyCode) return null
      const rate = rates[asset.currencyCode] ?? 1
      return asset.quantity * rate
    }
    case "bank":
      return asset.quantity
    case "other":
      return asset.unitCost != null ? asset.quantity * asset.unitCost : null
    default:
      return null
  }
}

function currencySymbol(code) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol
    || CURRENCY_SYMBOLS[code]
    || code
}

function formatQty(n, decimals = 2) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function Assets({ assets = [], onSaveAsset, onDeleteAsset }) {
  const { rates, goldTRY, silverTRY, loading: marketLoading, lastUpdated } = useMarketData()
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const totalTRY = useMemo(() => {
    let sum = 0
    let hasUnpriceable = false
    for (const a of assets) {
      const val = assetValueTRY(a, rates, goldTRY, silverTRY)
      if (val == null) hasUnpriceable = true
      else sum += val
    }
    return { sum, hasUnpriceable }
  }, [assets, rates, goldTRY, silverTRY])

  const totalGoldGrams = useMemo(
    () => assets.filter((a) => a.assetType === "gold").reduce((s, a) => s + goldGrams(a), 0),
    [assets]
  )
  const totalSilverGrams = useMemo(
    () => assets.filter((a) => a.assetType === "silver").reduce((s, a) => s + a.quantity, 0),
    [assets]
  )
  const goldValueTRY = goldTRY ? totalGoldGrams * goldTRY : null
  const silverValueTRY = silverTRY ? totalSilverGrams * silverTRY : null

  const currencyGroups = useMemo(() => {
    const map = {}
    for (const a of assets.filter((a) => a.assetType === "currency")) {
      const code = a.currencyCode || "?"
      map[code] = (map[code] || 0) + a.quantity
    }
    return map
  }, [assets])

  const bankTotal = useMemo(
    () => assets.filter((a) => a.assetType === "bank").reduce((s, a) => s + a.quantity, 0),
    [assets]
  )

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }

  const openEdit = (asset) => {
    setForm({
      name: asset.name,
      assetType: asset.assetType,
      goldUnit: asset.goldUnit || "gram",
      currencyCode: asset.currencyCode || "USD",
      quantity: String(asset.quantity),
      unitCost: asset.unitCost != null ? String(asset.unitCost) : "",
      note: asset.note || "",
    })
    setEditId(asset.id)
    setShowForm(true)
  }

  const save = () => {
    const quantity = parseFloat(form.quantity)
    if (!form.name || !Number.isFinite(quantity) || quantity < 0) return
    const unitCost = form.assetType === "other" && form.unitCost ? parseFloat(form.unitCost) : null
    onSaveAsset(
      {
        name: form.name,
        assetType: form.assetType,
        goldUnit: form.assetType === "gold" ? form.goldUnit : null,
        currencyCode: form.assetType === "currency" ? form.currencyCode : null,
        quantity,
        unitCost: Number.isFinite(unitCost) ? unitCost : null,
        note: form.note,
      },
      editId
    )
    resetForm()
  }

  const assetTypeInfo = (type) => ASSET_TYPES.find((t) => t.value === type) ?? ASSET_TYPES.at(-1)

  const assetSubtitle = (asset) => {
    if (asset.assetType === "gold") {
      const u = GOLD_UNITS.find((u) => u.value === asset.goldUnit)
      return `${u?.label ?? "Altın"} · ${asset.quantity} adet · ${formatQty(goldGrams(asset))} gr`
    }
    if (asset.assetType === "silver") {
      return `Gümüş · ${formatQty(asset.quantity)} gr`
    }
    if (asset.assetType === "currency") {
      const sym = currencySymbol(asset.currencyCode)
      const label = CURRENCY_OPTIONS.find((c) => c.code === asset.currencyCode)?.label || asset.currencyCode
      return `${label} · ${sym}${formatQty(asset.quantity)}`
    }
    if (asset.assetType === "bank") return `Banka / TRY · ${TRY(asset.quantity)}`
    return asset.note || "Diğer"
  }

  const iconBg = (type) => {
    if (type === "gold")    return `linear-gradient(135deg,${S.amber}55,${S.amber}22)`
    if (type === "silver")  return `linear-gradient(135deg,#aaa8,#aaa2)`
    if (type === "currency")return `linear-gradient(135deg,${S.cyan}55,${S.cyan}22)`
    return `linear-gradient(135deg,${S.green}55,${S.green}22)`
  }

  const statsRow = [
    { label: "Toplam Değer", value: TRY(totalTRY.sum) + (totalTRY.hasUnpriceable ? " +" : ""), color: S.green },
    { label: "Altın (gr)", value: `${formatQty(totalGoldGrams)} gr`, sub: goldValueTRY ? TRY(goldValueTRY) : null, color: S.amber },
    { label: "Gümüş (gr)", value: `${formatQty(totalSilverGrams)} gr`, sub: silverValueTRY ? TRY(silverValueTRY) : null, color: "#aaa" },
    { label: "TRY Mevduat", value: TRY(bankTotal), color: S.cyan },
  ]

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Servet Takibi</span>
          <h1 className="page-title">Varlıklarım</h1>
          <p className="page-subtitle">Altın, gümüş, döviz ve banka hesaplarını tek yerden gör.</p>
        </div>
        <button style={btnPrimary} onClick={openAdd}>+ Varlık Ekle</button>
      </div>

      {/* Özet bar */}
      <div className="stat-bar">
        {statsRow.map((stat) => (
          <div key={stat.label} className="glass-card stat-bar-item" style={{ borderLeft: `3px solid ${stat.color}` }}>
            <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
              {stat.label}
            </div>
            <div className="finance-number" style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 17, color: stat.color }}>
              {stat.value}
            </div>
            {stat.sub && (
              <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{stat.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Canlı kur şeridi */}
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 14, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        {goldTRY ? (
          <span>Gram Altın: <span style={{ color: S.amber, fontFamily: FONT_MONO, fontWeight: 700 }}>{TRY(goldTRY)}</span></span>
        ) : marketLoading ? (
          <span style={{ color: S.muted }}>Altın kuru yükleniyor...</span>
        ) : (
          <span style={{ color: S.red }}>Altın kuru alınamadı</span>
        )}
        {silverTRY && (
          <span>Gram Gümüş: <span style={{ color: "#aaa", fontFamily: FONT_MONO, fontWeight: 700 }}>{TRY(silverTRY)}</span></span>
        )}
        {["USD", "EUR", "GBP", "CHF"].map((code) =>
          rates?.[code] ? (
            <span key={code}>
              {code}: <span style={{ color: S.cyan, fontFamily: FONT_MONO, fontWeight: 700 }}>{TRY(rates[code])}</span>
            </span>
          ) : null
        )}
        {lastUpdated && (
          <span style={{ marginLeft: "auto", opacity: 0.55 }}>
            {lastUpdated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} güncellendi
          </span>
        )}
      </div>

      {/* Döviz pozisyonu özeti */}
      {Object.keys(currencyGroups).length > 0 && rates && (
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Döviz Pozisyonu
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {Object.entries(currencyGroups).map(([code, qty]) => {
              const sym = currencySymbol(code)
              const tryVal = rates[code] ? qty * rates[code] : null
              return (
                <div key={code} className="glass-card" style={{ padding: "8px 14px", borderRadius: 8, minWidth: 110 }}>
                  <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, marginBottom: 3 }}>{code}</div>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 700, color: S.cyan }}>
                    {sym}{formatQty(qty)}
                  </div>
                  {tryVal != null && <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{TRY(tryVal)}</div>}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 14 }}>
            {editId ? "Varlığı Düzenle" : "Yeni Varlık"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <div>
              <FieldLabel>Varlık Adı</FieldLabel>
              <input
                style={inputStyle}
                placeholder="örn. Gram altın birikimim"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel>Tür</FieldLabel>
              <select
                style={inputStyle}
                value={form.assetType}
                onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value }))}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            {form.assetType === "gold" && (
              <div>
                <FieldLabel>Altın Türü</FieldLabel>
                <select
                  style={inputStyle}
                  value={form.goldUnit}
                  onChange={(e) => setForm((f) => ({ ...f, goldUnit: e.target.value }))}
                >
                  {GOLD_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            )}

            {form.assetType === "currency" && (
              <div>
                <FieldLabel>Para Birimi</FieldLabel>
                <select
                  style={inputStyle}
                  value={form.currencyCode}
                  onChange={(e) => setForm((f) => ({ ...f, currencyCode: e.target.value }))}
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <FieldLabel>
                {form.assetType === "gold" ? "Adet" :
                 form.assetType === "silver" ? "Miktar (gram)" :
                 form.assetType === "currency" ? "Miktar" :
                 "Tutar (TRY)"}
              </FieldLabel>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>

            {form.assetType === "other" && (
              <div>
                <FieldLabel>Birim Maliyet (TRY)</FieldLabel>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.unitCost}
                  onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                />
              </div>
            )}

            <div>
              <FieldLabel>Not (isteğe bağlı)</FieldLabel>
              <input
                style={inputStyle}
                placeholder="örn. Garanti Bankası"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button style={btnPrimary} onClick={save}>Kaydet</button>
            <button style={btnGhost} onClick={resetForm}>İptal</button>
          </div>
        </Card>
      )}

      {/* Varlık listesi */}
      {assets.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪙</div>
          <div style={{ fontWeight: 700, color: S.text, marginBottom: 6 }}>Henüz varlık yok</div>
          <div style={{ color: S.muted, fontSize: 13 }}>Altın, gümüş, döviz veya banka hesabını ekleyerek başla.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {assets.map((asset) => {
            const valueTRY = assetValueTRY(asset, rates, goldTRY, silverTRY)
            const info = assetTypeInfo(asset.assetType)
            return (
              <div
                key={asset.id}
                className="glass-card"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10 }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: iconBg(asset.assetType),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {info.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: S.text, marginBottom: 2 }}>
                    {asset.name}
                  </div>
                  <div style={{ fontSize: 12, color: S.muted }}>
                    {assetSubtitle(asset)}
                    {asset.note && asset.assetType !== "other" && (
                      <span style={{ marginLeft: 6 }}>· {asset.note}</span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {valueTRY != null ? (
                    <div className="finance-number" style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 15, color: S.green }}>
                      {TRY(valueTRY)}
                    </div>
                  ) : marketLoading ? (
                    <div style={{ fontSize: 12, color: S.muted }}>...</div>
                  ) : (
                    <div style={{ fontSize: 13, color: S.muted }}>—</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={{ ...btnGhost, padding: "5px 10px", fontSize: 11 }} onClick={() => openEdit(asset)}>
                    Düzenle
                  </button>
                  <button style={{ ...btnDanger, padding: "5px 10px", fontSize: 11 }} onClick={() => onDeleteAsset(asset.id)}>
                    Sil
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
