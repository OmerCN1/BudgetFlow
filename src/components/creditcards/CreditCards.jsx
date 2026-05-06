import { useState, useMemo, useRef, useCallback } from "react"
import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, inputStyle, btnGhost, btnPrimary, btnDanger, PALETTE } from "../../constants/theme"
import { TRY, today } from "../../utils/helpers"

const CARD_TYPES = ["Visa", "Mastercard", "Amex", "Troy", "Diğer"]
const CARD_COLORS = [
  "#4edea3", "#4cd7f6", "#f59e0b", "#f43f5e", "#8b5cf6",
  "#06b6d4", "#10b981", "#ec4899", "#6366f1", "#334155",
]

const emptyForm = {
  name: "",
  bankName: "",
  cardType: "Visa",
  creditLimit: "",
  currentDebt: "",
  statementDay: "1",
  dueDay: "15",
  minPaymentRate: "3",
  color: "#4edea3",
}

const emptyPaymentForm = {
  creditCardId: "",
  statementId: "",
  amount: "",
  paymentDate: today(),
  note: "",
}

function daysUntil(dayOfMonth) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (target <= now) target.setMonth(target.getMonth() + 1)
  return Math.ceil((target - now) / 86400000)
}

// ─── 3D Physical Card ───────────────────────────────────────────────────────

function PhysicalCard({ card, isSelected, onClick }) {
  const cardRef = useRef(null)
  const glowRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  const used = card.currentDebt
  const limit = card.creditLimit
  const usageRate = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const remaining = Math.max(limit - used, 0)
  const barColor = usageRate > 80 ? "#f43f5e" : usageRate > 50 ? "#f59e0b" : "#4edea3"

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setTilt({
      x: ((y - cy) / cy) * -12,
      y: ((x - cx) / cx) * 12,
    })
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlowPos({ x: 50, y: 50 })
    setHovered(false)
  }, [])

  const c = card.color

  // Derive a second gradient color by rotating hue
  const gradientEnd = shiftColor(c, 40)

  return (
    <div
      className="creditcards-info-panel"
      style={{
        perspective: 900,
        width: "100%",
        maxWidth: 380,
        margin: "0 auto",
      }}
    >
      <button
        ref={cardRef}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.586",   // ISO 7810 ID-1
          borderRadius: 16,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
          overflow: "hidden",
          background: "transparent",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.03 : isSelected ? 1.02 : 1})`,
          transition: hovered
            ? "transform 0.08s ease-out, box-shadow 0.2s"
            : "transform 0.5s cubic-bezier(.25,.8,.25,1), box-shadow 0.4s",
          boxShadow: isSelected
            ? `0 20px 60px ${c}55, 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`
            : hovered
            ? `0 24px 64px ${c}40, 0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 8px 24px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Base gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${c}ee 0%, ${gradientEnd}cc 60%, #0a1a12 100%)`,
            borderRadius: 16,
          }}
        />

        {/* Holographic shimmer layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: `radial-gradient(ellipse at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,${hovered ? 0.18 : 0.06}) 0%, transparent 65%)`,
            mixBlendMode: "screen",
            transition: hovered ? "none" : "background 0.4s",
            pointerEvents: "none",
          }}
        />

        {/* Diagonal gloss streak */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            background: "linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 40%, rgba(255,255,255,0.04) 60%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Subtle noise texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
            pointerEvents: "none",
          }}
        />

        {/* Card content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "7% 8%",
            boxSizing: "border-box",
          }}
        >
          {/* Row 1: bank + network logo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "clamp(8px,2.2vw,11px)", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                {card.bankName || "BudgetAssist"}
              </div>
              <div style={{ fontSize: "clamp(11px,3vw,15px)", fontWeight: 800, color: "#fff", letterSpacing: "0.02em" }}>
                {card.name}
              </div>
            </div>
            <NetworkLogo type={card.cardType} />
          </div>

          {/* Row 2: Chip */}
          <div style={{ marginTop: "auto", marginBottom: "2%" }}>
            <ChipSVG />
          </div>

          {/* Row 3: masked card number */}
          <div style={{ fontFamily: FONT_MONO, fontSize: "clamp(11px,3.2vw,16px)", letterSpacing: "0.22em", color: "rgba(255,255,255,0.88)", marginBottom: "3%" }}>
            •••• &nbsp;•••• &nbsp;•••• &nbsp;1234
          </div>

          {/* Row 4: debt/limit + usage bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2%" }}>
              <div>
                <div style={{ fontSize: "clamp(7px,1.8vw,9px)", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Borç</div>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: "clamp(12px,3.2vw,17px)", color: barColor === "#4edea3" ? "#fff" : barColor }}>
                  {TRY(used)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "clamp(7px,1.8vw,9px)", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Limit</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: "clamp(10px,2.6vw,13px)", color: "rgba(255,255,255,0.7)" }}>
                  {TRY(limit)}
                </div>
              </div>
            </div>
            {/* Usage bar */}
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${usageRate}%`,
                  background: barColor,
                  borderRadius: 2,
                  boxShadow: `0 0 8px ${barColor}88`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5%" }}>
              <span style={{ fontSize: "clamp(7px,1.6vw,9px)", color: "rgba(255,255,255,0.45)" }}>%{usageRate.toFixed(0)} kullanım</span>
              <span style={{ fontSize: "clamp(7px,1.6vw,9px)", color: "rgba(255,255,255,0.55)" }}>{TRY(remaining)} kalan</span>
            </div>
          </div>
        </div>

        {/* Selected ring */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: 18,
              border: `2px solid ${c}`,
              pointerEvents: "none",
              boxShadow: `0 0 0 4px ${c}28`,
            }}
          />
        )}
      </button>
    </div>
  )
}

// EMV chip SVG
function ChipSVG() {
  return (
    <svg width="38" height="30" viewBox="0 0 38 30" fill="none" style={{ display: "block" }}>
      <rect x="1" y="1" width="36" height="28" rx="5" fill="#c8a84b" stroke="#a8882a" strokeWidth="0.8" />
      <rect x="7" y="1" width="1.2" height="28" fill="#a8882a" opacity="0.5" />
      <rect x="29.8" y="1" width="1.2" height="28" fill="#a8882a" opacity="0.5" />
      <rect x="1" y="9" width="36" height="1.2" fill="#a8882a" opacity="0.5" />
      <rect x="1" y="19.8" width="36" height="1.2" fill="#a8882a" opacity="0.5" />
      <rect x="12" y="8" width="14" height="14" rx="2.5" fill="#e8c860" stroke="#a8882a" strokeWidth="0.6" />
      <rect x="15" y="11" width="8" height="8" rx="1.2" fill="#c8a84b" />
      <line x1="19" y1="8" x2="19" y2="11" stroke="#a8882a" strokeWidth="0.8" />
      <line x1="19" y1="19" x2="19" y2="22" stroke="#a8882a" strokeWidth="0.8" />
      <line x1="12" y1="15" x2="15" y2="15" stroke="#a8882a" strokeWidth="0.8" />
      <line x1="23" y1="15" x2="26" y2="15" stroke="#a8882a" strokeWidth="0.8" />
    </svg>
  )
}

// Network logos
function NetworkLogo({ type }) {
  if (type === "Visa") {
    return (
      <div style={{ fontFamily: "'Times New Roman', serif", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(16px,4vw,22px)", color: "#fff", letterSpacing: "-0.02em", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
        VISA
      </div>
    )
  }
  if (type === "Mastercard") {
    return (
      <svg width="42" height="28" viewBox="0 0 42 28">
        <circle cx="15" cy="14" r="13" fill="#eb001b" />
        <circle cx="27" cy="14" r="13" fill="#f79e1b" />
        <path d="M21 5.3a13 13 0 0 1 0 17.4A13 13 0 0 1 21 5.3Z" fill="#ff5f00" />
      </svg>
    )
  }
  if (type === "Amex") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: "clamp(9px,2.4vw,12px)", color: "#fff", letterSpacing: "0.14em", background: "rgba(255,255,255,0.18)", borderRadius: 4, padding: "3px 7px" }}>
        AMEX
      </div>
    )
  }
  if (type === "Troy") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: "clamp(9px,2.4vw,12px)", color: "#fff", letterSpacing: "0.08em", background: "rgba(255,255,255,0.18)", borderRadius: 4, padding: "3px 7px" }}>
        TROY
      </div>
    )
  }
  return (
    <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: "clamp(8px,2vw,11px)", color: "rgba(255,255,255,0.6)" }}>
      ••••
    </div>
  )
}

// Quick hue shift helper (no deps)
function shiftColor(hex, amount) {
  const h2r = (h) => parseInt(h.slice(1, 3), 16)
  const h2g = (h) => parseInt(h.slice(3, 5), 16)
  const h2b = (h) => parseInt(h.slice(5, 7), 16)
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
  try {
    const r = clamp(h2r(hex) - amount * 0.4)
    const g = clamp(h2g(hex) - amount * 0.2)
    const b = clamp(h2b(hex) + amount * 0.8)
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  } catch {
    return "#0a1a12"
  }
}

// ─── Info panel shown below selected card ───────────────────────────────────

function CardInfoPanel({ card, onEdit, onDelete }) {
  const dueDays = daysUntil(card.dueDay)
  const stmtDays = daysUntil(card.statementDay)
  const minPayment = (card.currentDebt * card.minPaymentRate) / 100
  const usageRate = card.creditLimit > 0 ? (card.currentDebt / card.creditLimit) * 100 : 0
  const barColor = usageRate > 80 ? S.red : usageRate > 50 ? S.amber : S.green

  return (
    <div
      style={{
        background: `${card.color}0a`,
        border: `1px solid ${card.color}30`,
        borderRadius: 14,
        padding: "16px 18px",
        marginTop: 14,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
      }}
    >
      <InfoChip label="Ekstre Günü" value={`${card.statementDay}. gün`} sub={`${stmtDays} gün kaldı`} color={S.cyan} />
      <InfoChip label="Son Ödeme" value={`${card.dueDay}. gün`} sub={`${dueDays} gün kaldı`} color={dueDays <= 3 ? S.red : dueDays <= 7 ? S.amber : S.cyan} />
      <InfoChip label="Asgari Ödeme" value={TRY(minPayment)} sub={`%${card.minPaymentRate} oran`} color={S.amber} />

      <div className="creditcards-info-actions" style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end", paddingTop: 4 }}>
        <button style={{ ...btnGhost, fontSize: 13 }} onClick={onEdit}>Düzenle</button>
        <button style={{ ...btnDanger, fontSize: 13 }} onClick={onDelete}>Sil</button>
      </div>
    </div>
  )
}

function InfoChip({ label, value, sub, color }) {
  return (
    <div style={{ background: `${color}12`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: S.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 15, color }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: S.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function CreditCards({ creditCards = [], txs = [], statements = [], payments = [], onSave, onDelete, onSavePayment }) {
  const [form, setForm] = useState(emptyForm)
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm)
  const [editingId, setEditingId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const totalDebt = useMemo(() => creditCards.reduce((s, c) => s + c.currentDebt, 0), [creditCards])
  const totalLimit = useMemo(() => creditCards.reduce((s, c) => s + c.creditLimit, 0), [creditCards])
  const totalMin = useMemo(
    () => creditCards.reduce((s, c) => s + (c.currentDebt * c.minPaymentRate) / 100, 0),
    [creditCards]
  )

  const startEdit = (card) => {
    setEditingId(card.id)
    setForm({
      name: card.name,
      bankName: card.bankName,
      cardType: card.cardType,
      creditLimit: String(card.creditLimit),
      currentDebt: String(card.currentDebt),
      statementDay: String(card.statementDay),
      dueDay: String(card.dueDay),
      minPaymentRate: String(card.minPaymentRate),
      color: card.color,
    })
    setShowForm(true)
  }

  const reset = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const save = () => {
    const limit = parseFloat(form.creditLimit)
    const debt = parseFloat(form.currentDebt)
    if (!form.name || !Number.isFinite(limit) || limit <= 0) return
    onSave(
      {
        name: form.name.trim(),
        bankName: form.bankName.trim(),
        cardType: form.cardType,
        creditLimit: limit,
        currentDebt: Number.isFinite(debt) && debt >= 0 ? debt : 0,
        statementDay: parseInt(form.statementDay) || 1,
        dueDay: parseInt(form.dueDay) || 15,
        minPaymentRate: parseFloat(form.minPaymentRate) || 3,
        color: form.color,
      },
      editingId
    )
    reset()
  }

  const selected = creditCards.find((c) => c.id === selectedId)
  const statementRows = useMemo(
    () => buildCardStatements(creditCards, txs, payments, statements),
    [creditCards, txs, payments, statements]
  )
  const upcomingStatements = statementRows.filter((row) => row.status !== "paid").slice(0, 6)
  const recentPayments = payments.slice(0, 5)

  const savePayment = () => {
    const cardId = paymentForm.creditCardId || creditCards[0]?.id || ""
    if (!cardId || !paymentForm.amount || !onSavePayment) return
    const selectedStatement = statementRows.find((row) => row.id === paymentForm.statementId)
    onSavePayment({
      ...paymentForm,
      creditCardId: cardId,
      statementId: selectedStatement?.persistedId || "",
      statementDraft: selectedStatement && !selectedStatement.persistedId ? {
        creditCardId: selectedStatement.creditCardId,
        periodStart: selectedStatement.periodStart,
        periodEnd: selectedStatement.periodEnd,
        statementDate: selectedStatement.statementDate,
        dueDate: selectedStatement.dueDate,
        totalAmount: selectedStatement.totalAmount,
        minPaymentAmount: selectedStatement.minPaymentAmount,
      } : null,
      amount: parseFloat(paymentForm.amount),
    })
    setPaymentForm({ ...emptyPaymentForm, creditCardId: cardId })
  }

  return (
    <div className="creditcards-page" style={{ maxWidth: 920, margin: "0 auto", padding: "0 0 48px" }}>

      {/* Summary bar */}
      {creditCards.length > 0 && (
        <div className="creditcards-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          <SummaryTile label="Toplam Borç" value={TRY(totalDebt)} color={S.red} />
          <SummaryTile label="Toplam Limit" value={TRY(totalLimit)} color={S.cyan} />
          <SummaryTile label="Asgari Ödemeler" value={TRY(totalMin)} color={S.amber} />
        </div>
      )}

      {/* Empty state */}
      {creditCards.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: S.muted }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>💳</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: S.sub }}>
            Henüz kredi kartı eklenmedi
          </div>
          <div style={{ fontSize: 14, marginBottom: 22 }}>
            Limit, ekstre ve ödeme tarihlerinizi takip edin
          </div>
          <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Kart Ekle</button>
        </div>
      )}

      {/* Card grid */}
      {creditCards.length > 0 && (
        <>
          <div
            className="creditcards-card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
              marginBottom: 4,
            }}
          >
            {creditCards.map((card) => (
              <div key={card.id}>
                <PhysicalCard
                  card={card}
                  isSelected={selectedId === card.id}
                  onClick={() => setSelectedId(selectedId === card.id ? null : card.id)}
                />
                {selectedId === card.id && (
                  <CardInfoPanel
                    card={card}
                    onEdit={() => startEdit(card)}
                    onDelete={() => { onDelete(card.id); setSelectedId(null) }}
                  />
                )}
              </div>
            ))}
          </div>

          {!showForm && (
            <div style={{ marginTop: 24 }}>
              <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Kart Ekle</button>
            </div>
          )}
        </>
      )}

      {creditCards.length > 0 && (
        <Card style={{ marginTop: 18, marginBottom: 20, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <FieldLabel>Ekstre ve Ödeme</FieldLabel>
            <span style={{ color: S.muted, fontSize: 11 }}>
              {upcomingStatements.length > 0 ? `${upcomingStatements.length} açık ekstre` : "Kart işlemleriyle oluşur"}
            </span>
          </div>
          <div className="creditcards-statement-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(280px, 0.95fr)", gap: 14, alignItems: "start" }}>
            <div>
              {upcomingStatements.length === 0 ? (
                <div className="glass-card" style={{ padding: "12px 14px", color: S.muted, fontSize: 13 }}>
                  Kredi kartına bağlı harcama eklenince ekstreler burada listelenir.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {upcomingStatements.slice(0, 4).map((statement) => (
                    <div key={statement.id} className="glass-card" style={{ padding: "9px 11px", display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: S.text, fontSize: 13 }}>{statement.cardName}</strong>
                        <div style={{ color: S.muted, fontSize: 10 }}>
                          {statement.periodStart} - {statement.periodEnd} · {statement.dueDate}
                        </div>
                        <div style={{ color: S.sub, fontSize: 10, marginTop: 1 }}>
                          Ödenen {TRY(statement.paidAmount)} · {statement.statusLabel}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="finance-number" style={{ color: statement.remaining > 0 ? S.red : S.green, fontFamily: FONT_MONO, fontWeight: 800, fontSize: 13 }}>
                          {TRY(statement.remaining)}
                        </div>
                        <small style={{ color: S.muted, fontSize: 10 }}>Asgari {TRY(statement.minPaymentAmount)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "grid", gap: 8 }}>
                <div className="creditcards-payment-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <select
                    style={{ ...inputStyle, minHeight: 42, padding: "10px 12px" }}
                    value={paymentForm.creditCardId || creditCards[0]?.id || ""}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, creditCardId: e.target.value, statementId: "" }))}
                  >
                    {creditCards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
                  </select>
                  <select
                    style={{ ...inputStyle, minHeight: 42, padding: "10px 12px" }}
                    value={paymentForm.statementId}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, statementId: e.target.value }))}
                  >
                    <option value="">Ekstreye bağlama</option>
                    {statementRows
                      .filter((row) => row.creditCardId === (paymentForm.creditCardId || creditCards[0]?.id))
                      .slice(0, 8)
                      .map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.statementDate} · {TRY(row.remaining)} kalan
                        </option>
                      ))}
                  </select>
                </div>
                <div className="creditcards-payment-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, minHeight: 42, padding: "10px 12px" }}
                    type="number"
                    min="0"
                    placeholder="Tutar"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  />
                  <input
                    style={{ ...inputStyle, minHeight: 42, padding: "10px 12px" }}
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, paymentDate: e.target.value }))}
                  />
                </div>
                <div className="creditcards-payment-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, minHeight: 42, padding: "10px 12px" }}
                    placeholder="Not"
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                  />
                  <button style={{ ...btnPrimary, minHeight: 42, padding: "0 18px", whiteSpace: "nowrap" }} onClick={savePayment}>Ödeme Kaydet</button>
                </div>
                {recentPayments.length > 0 && (
                  <div style={{ display: "grid", gap: 4, marginTop: 2 }}>
                    {recentPayments.slice(0, 3).map((payment) => {
                      const card = creditCards.find((item) => item.id === payment.creditCardId)
                      return (
                        <div key={payment.id} style={{ display: "flex", justifyContent: "space-between", color: S.muted, fontSize: 11 }}>
                          <span>{card?.name || "Kart"} · {payment.paymentDate}</span>
                          <strong style={{ color: S.green }}>{TRY(payment.amount)}</strong>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card style={{ marginTop: creditCards.length > 0 ? 28 : 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: S.text }}>
            {editingId ? "Kartı Düzenle" : "Yeni Kart Ekle"}
          </div>

          {/* Live preview */}
          <div className="creditcards-preview-wrap" style={{ marginBottom: 24, maxWidth: 340 }}>
            <PhysicalCard
              card={{
                name: form.name || "Kart Adı",
                bankName: form.bankName || "Banka",
                cardType: form.cardType,
                creditLimit: parseFloat(form.creditLimit) || 0,
                currentDebt: parseFloat(form.currentDebt) || 0,
                statementDay: parseInt(form.statementDay) || 1,
                dueDay: parseInt(form.dueDay) || 15,
                minPaymentRate: parseFloat(form.minPaymentRate) || 3,
                color: form.color,
                id: "__preview",
              }}
              isSelected={false}
              onClick={() => {}}
            />
            <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: S.muted }}>Önizleme</div>
          </div>

          <div className="creditcards-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <FieldLabel>Kart Adı *</FieldLabel>
              <input style={inputStyle} placeholder="örn: Akbank Axess" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Banka Adı</FieldLabel>
              <input style={inputStyle} placeholder="örn: Akbank" value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Kart Tipi</FieldLabel>
              <select style={inputStyle} value={form.cardType}
                onChange={(e) => setForm({ ...form, cardType: e.target.value })}>
                {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <FieldLabel>Kredi Limiti (₺) *</FieldLabel>
              <input style={inputStyle} type="number" min="0" placeholder="50000" value={form.creditLimit}
                onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Güncel Borç (₺)</FieldLabel>
              <input style={inputStyle} type="number" min="0" placeholder="0" value={form.currentDebt}
                onChange={(e) => setForm({ ...form, currentDebt: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Ekstre Kesim Günü</FieldLabel>
              <input style={inputStyle} type="number" min="1" max="31" placeholder="1" value={form.statementDay}
                onChange={(e) => setForm({ ...form, statementDay: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Son Ödeme Günü</FieldLabel>
              <input style={inputStyle} type="number" min="1" max="31" placeholder="15" value={form.dueDay}
                onChange={(e) => setForm({ ...form, dueDay: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Asgari Ödeme Oranı (%)</FieldLabel>
              <input style={inputStyle} type="number" min="0" max="100" step="0.5" placeholder="3" value={form.minPaymentRate}
                onChange={(e) => setForm({ ...form, minPaymentRate: e.target.value })} />
            </div>

            <div>
              <FieldLabel>Kart Rengi</FieldLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {CARD_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                      border: form.color === c ? `2.5px solid ${S.text}` : "2.5px solid transparent",
                      outline: "none",
                      boxShadow: form.color === c ? `0 0 0 2px ${c}70` : "none",
                      transition: "box-shadow 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="creditcards-form-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button style={btnPrimary} onClick={save}>{editingId ? "Güncelle" : "Kaydet"}</button>
            <button style={btnGhost} onClick={reset}>İptal</button>
          </div>
        </Card>
      )}
    </div>
  )
}

function SummaryTile({ label, value, color }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 18, color }}>
        {value}
      </div>
    </div>
  )
}

function buildCardStatements(cards, txs, payments, persistedStatements) {
  const persistedByKey = new Map(
    persistedStatements.map((statement) => [
      `${statement.creditCardId}:${statement.statementDate}`,
      statement,
    ])
  )
  const paidByStatement = new Map()
  const paidByCard = new Map()
  payments.forEach((payment) => {
    if (payment.statementId) paidByStatement.set(payment.statementId, (paidByStatement.get(payment.statementId) || 0) + payment.amount)
    paidByCard.set(payment.creditCardId, (paidByCard.get(payment.creditCardId) || 0) + payment.amount)
  })

  return cards
    .flatMap((card) => {
      const cardTxs = txs.filter((tx) => tx.creditCardId === card.id && tx.type === "expense")
      const periods = new Map()
      cardTxs.forEach((tx) => {
        const period = statementPeriodFor(tx.date, card.statementDay, card.dueDay)
        const key = period.statementDate
        const current = periods.get(key) || { ...period, amount: 0, txCount: 0 }
        current.amount += tx.amount
        current.txCount += 1
        periods.set(key, current)
      })

      return [...periods.values()].map((period) => {
        const persisted = persistedByKey.get(`${card.id}:${period.statementDate}`)
        const paidAmount = persisted
          ? Math.max(persisted.paidAmount, paidByStatement.get(persisted.id) || 0)
          : 0
        const totalAmount = persisted?.totalAmount || period.amount
        const remaining = Math.max(totalAmount - paidAmount, 0)
        const status = remaining <= 0 ? "paid" : new Date(period.dueDate) < new Date(today()) ? "overdue" : paidAmount > 0 ? "partial" : "open"
        return {
          id: persisted?.id || `${card.id}-${period.statementDate}`,
          persistedId: persisted?.id || "",
          creditCardId: card.id,
          cardName: card.name,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          statementDate: period.statementDate,
          dueDate: period.dueDate,
          totalAmount,
          minPaymentAmount: persisted?.minPaymentAmount || (totalAmount * card.minPaymentRate) / 100,
          paidAmount,
          remaining,
          status,
          statusLabel: status === "paid" ? "Ödendi" : status === "partial" ? "Kısmi" : status === "overdue" ? "Gecikti" : "Açık",
          txCount: period.txCount,
        }
      })
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

function statementPeriodFor(txDate, statementDay, dueDay) {
  const date = new Date(`${txDate}T12:00:00`)
  const y = date.getFullYear()
  const m = date.getMonth()
  const currentStatement = new Date(y, m, clampDay(y, m, statementDay))
  const statementDate = date <= currentStatement
    ? currentStatement
    : new Date(y, m + 1, clampDay(y, m + 1, statementDay))
  const previousStatement = new Date(statementDate)
  previousStatement.setMonth(previousStatement.getMonth() - 1)
  previousStatement.setDate(clampDay(previousStatement.getFullYear(), previousStatement.getMonth(), statementDay) + 1)
  const periodEnd = new Date(statementDate)
  const dueDate = new Date(statementDate.getFullYear(), statementDate.getMonth(), clampDay(statementDate.getFullYear(), statementDate.getMonth(), dueDay))
  if (dueDate <= statementDate) dueDate.setMonth(dueDate.getMonth() + 1)

  return {
    periodStart: isoDate(previousStatement),
    periodEnd: isoDate(periodEnd),
    statementDate: isoDate(statementDate),
    dueDate: isoDate(dueDate),
  }
}

function clampDay(year, month, day) {
  return Math.min(Math.max(Number(day) || 1, 1), new Date(year, month + 1, 0).getDate())
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}
