import { useMemo, useState } from "react"
import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, inputStyle, btnGhost, btnPrimary, btnDanger, PALETTE } from "../../constants/theme"
import { today, TRY } from "../../utils/helpers"

const emptyDebtForm = {
  personName: "",
  amount: "",
  direction: "i_owe",
  description: "",
  dueDate: "",
}

const emptyPaymentForm = {
  debtId: "",
  amount: "",
  paymentDate: today(),
  note: "",
}

export default function DebtTracker({
  debts = [],
  debtPayments = [],
  onSaveDebt,
  onDeleteDebt,
  onSettleDebt,
  onAddPayment,
}) {
  const [debtForm, setDebtForm] = useState(emptyDebtForm)
  const [editingDebtId, setEditingDebtId] = useState(null)
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm)
  const [tab, setTab] = useState("active")
  const [expandedDebtId, setExpandedDebtId] = useState(null)

  const activeDebts = debts.filter((d) => !d.isSettled)
  const settledDebts = debts.filter((d) => d.isSettled)

  const iOwe = activeDebts.filter((d) => d.direction === "i_owe")
  const owedToMe = activeDebts.filter((d) => d.direction === "owed_to_me")

  const totalIOwe = useMemo(() => iOwe.reduce((sum, d) => sum + d.amount, 0), [iOwe])
  const totalOwedToMe = useMemo(() => owedToMe.reduce((sum, d) => sum + d.amount, 0), [owedToMe])
  const netBalance = totalOwedToMe - totalIOwe

  const paymentsForDebt = (debtId) => debtPayments.filter((p) => p.debtId === debtId)
  const paidAmount = (debtId) => paymentsForDebt(debtId).reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = (debt) => Math.max(debt.amount - paidAmount(debt.id), 0)

  const resetDebtForm = () => {
    setDebtForm(emptyDebtForm)
    setEditingDebtId(null)
  }

  const editDebt = (debt) => {
    setEditingDebtId(debt.id)
    setDebtForm({
      personName: debt.personName,
      amount: String(debt.amount),
      direction: debt.direction,
      description: debt.description || "",
      dueDate: debt.dueDate || "",
    })
  }

  const saveDebt = () => {
    if (!debtForm.personName || !debtForm.amount) return
    const amount = parseFloat(debtForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return
    onSaveDebt({ ...debtForm, amount }, editingDebtId)
    resetDebtForm()
  }

  const addPayment = () => {
    if (!paymentForm.debtId || !paymentForm.amount) return
    const amount = parseFloat(paymentForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return
    onAddPayment({ ...paymentForm, amount })
    setPaymentForm({ ...emptyPaymentForm, debtId: paymentForm.debtId })
  }

  const displayedDebts = tab === "active" ? activeDebts : settledDebts

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Borç Takibi</span>
          <h1 className="page-title">Kişiler Arası Borçlar</h1>
          <p className="page-subtitle">Aldığın ve verdiğin borçları takip et, ödeme geçmişini gör.</p>
        </div>
      </div>

      <div className="stat-bar">
        {[
          { label: "Bana Borçlu", value: TRY(totalOwedToMe), color: S.green },
          { label: "Benim Borcum", value: TRY(totalIOwe), color: S.red },
          { label: "Net Durum", value: TRY(Math.abs(netBalance)), color: netBalance >= 0 ? S.green : S.red, prefix: netBalance >= 0 ? "+" : "-" },
          { label: "Aktif Kayıt", value: activeDebts.length, color: S.cyan },
        ].map((stat) => (
          <div key={stat.label} className="stat-bar-item stagger-item">
            <span className="stat-bar-label">{stat.label}</span>
            <span className="stat-bar-value finance-number" style={{ color: stat.color }}>
              {stat.prefix || ""}{stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="debt-tracker-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Card>
            <FieldLabel>{editingDebtId ? "Borcu Düzenle" : "Yeni Borç Ekle"}</FieldLabel>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { value: "i_owe", label: "Ben borçluyum" },
                { value: "owed_to_me", label: "Bana borçlu" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDebtForm((f) => ({ ...f, direction: opt.value }))}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${debtForm.direction === opt.value
                      ? opt.value === "i_owe" ? "rgba(244,63,94,0.5)" : "rgba(78,222,163,0.5)"
                      : S.border}`,
                    background: debtForm.direction === opt.value
                      ? opt.value === "i_owe" ? "rgba(244,63,94,0.10)" : "rgba(78,222,163,0.10)"
                      : "rgba(255,255,255,0.03)",
                    color: debtForm.direction === opt.value
                      ? opt.value === "i_owe" ? S.red : S.green
                      : S.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                style={inputStyle}
                placeholder="Kişi adı (örn. Ahmet)"
                value={debtForm.personName}
                onChange={(e) => setDebtForm((f) => ({ ...f, personName: e.target.value }))}
              />
              <input
                style={inputStyle}
                type="number"
                placeholder="Tutar (₺)"
                value={debtForm.amount}
                onChange={(e) => setDebtForm((f) => ({ ...f, amount: e.target.value }))}
              />
              <input
                style={inputStyle}
                placeholder="Açıklama (isteğe bağlı)"
                value={debtForm.description}
                onChange={(e) => setDebtForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div>
                <label style={{ fontSize: 11, color: S.muted, marginBottom: 4, display: "block" }}>
                  Vade tarihi (isteğe bağlı)
                </label>
                <input
                  style={inputStyle}
                  type="date"
                  value={debtForm.dueDate}
                  onChange={(e) => setDebtForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={saveDebt}
                disabled={!debtForm.personName || !debtForm.amount}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity: !debtForm.personName || !debtForm.amount ? 0.5 : 1,
                  cursor: !debtForm.personName || !debtForm.amount ? "not-allowed" : "pointer",
                }}
              >
                {editingDebtId ? "Güncelle" : "Kaydet"}
              </button>
              {editingDebtId && (
                <button type="button" onClick={resetDebtForm} style={{ ...btnGhost, padding: "10px 14px" }}>
                  İptal
                </button>
              )}
            </div>
          </Card>

          <Card>
            <FieldLabel>Ödeme Ekle</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                style={inputStyle}
                value={paymentForm.debtId}
                onChange={(e) => setPaymentForm((f) => ({ ...f, debtId: e.target.value }))}
              >
                <option value="">Borç seç...</option>
                {activeDebts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.direction === "i_owe" ? "↑" : "↓"} {d.personName} — {TRY(remainingAmount(d))} kalan
                  </option>
                ))}
              </select>
              <input
                style={inputStyle}
                type="number"
                placeholder="Ödeme tutarı (₺)"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              />
              <input
                style={inputStyle}
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
              />
              <input
                style={inputStyle}
                placeholder="Not (isteğe bağlı)"
                value={paymentForm.note}
                onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
              />
              <button
                type="button"
                onClick={addPayment}
                disabled={!paymentForm.debtId || !paymentForm.amount}
                style={{
                  ...btnPrimary,
                  opacity: !paymentForm.debtId || !paymentForm.amount ? 0.5 : 1,
                  cursor: !paymentForm.debtId || !paymentForm.amount ? "not-allowed" : "pointer",
                }}
              >
                Ödeme Ekle
              </button>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { value: "active", label: `Aktif (${activeDebts.length})` },
              { value: "settled", label: `Kapanan (${settledDebts.length})` },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                style={{
                  ...btnGhost,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: tab === t.value ? 800 : 500,
                  border: tab === t.value ? `1px solid ${S.green}55` : `1px solid ${S.border}`,
                  color: tab === t.value ? S.green : S.sub,
                  background: tab === t.value ? "rgba(78,222,163,0.08)" : "rgba(255,255,255,0.03)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {displayedDebts.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {tab === "active" ? "Aktif borç kaydı yok" : "Kapanan borç yok"}
              </div>
              <div style={{ color: S.muted, fontSize: 13 }}>
                {tab === "active" ? "Sol formu kullanarak yeni borç ekleyebilirsin." : "Kapanan borçlar burada görünür."}
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {displayedDebts.map((debt) => {
                const paid = paidAmount(debt.id)
                const remaining = remainingAmount(debt)
                const progress = debt.amount > 0 ? Math.min((paid / debt.amount) * 100, 100) : 0
                const isExpanded = expandedDebtId === debt.id
                const payments = paymentsForDebt(debt.id)
                const isOverdue = debt.dueDate && !debt.isSettled && debt.dueDate < today()

                return (
                  <Card key={debt.id} className="debt-card" style={{ padding: "14px 16px" }}>
                    <div className="debt-card-main" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: debt.direction === "i_owe"
                            ? "rgba(244,63,94,0.12)"
                            : "rgba(78,222,163,0.12)",
                          border: `1px solid ${debt.direction === "i_owe" ? "rgba(244,63,94,0.25)" : "rgba(78,222,163,0.25)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {debt.direction === "i_owe" ? "↑" : "↓"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>{debt.personName}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 999,
                              background: debt.direction === "i_owe" ? "rgba(244,63,94,0.1)" : "rgba(78,222,163,0.1)",
                              color: debt.direction === "i_owe" ? S.red : S.green,
                            }}
                          >
                            {debt.direction === "i_owe" ? "Benim borcum" : "Bana borçlu"}
                          </span>
                          {isOverdue && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: 999,
                                background: "rgba(245,158,11,0.12)",
                                color: S.amber,
                              }}
                            >
                              Vadesi geçti
                            </span>
                          )}
                        </div>

                        {debt.description && (
                          <div style={{ fontSize: 12, color: S.muted, marginBottom: 4 }}>{debt.description}</div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span
                            className="finance-number"
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: debt.direction === "i_owe" ? S.red : S.green,
                            }}
                          >
                            {TRY(debt.amount)}
                          </span>
                          {paid > 0 && (
                            <span style={{ fontSize: 11, color: S.muted }}>
                              {TRY(paid)} ödendi · {TRY(remaining)} kalan
                            </span>
                          )}
                        </div>

                        {debt.amount > 0 && paid > 0 && (
                          <div
                            style={{
                              marginTop: 8,
                              height: 4,
                              borderRadius: 2,
                              background: "rgba(255,255,255,0.07)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progress}%`,
                                borderRadius: 2,
                                background: debt.direction === "i_owe"
                                  ? `linear-gradient(90deg, ${S.red}, #ff6b6b)`
                                  : `linear-gradient(90deg, ${S.green}, ${S.cyan})`,
                                transition: "width 0.6s cubic-bezier(0.34,1.1,0.64,1)",
                              }}
                            />
                          </div>
                        )}

                        {debt.dueDate && (
                          <div style={{ fontSize: 11, color: isOverdue ? S.amber : S.muted, marginTop: 4 }}>
                            Vade: {new Date(debt.dueDate + "T12:00:00").toLocaleDateString("tr-TR")}
                          </div>
                        )}
                      </div>

                      <div className="debt-card-actions" style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                        {!debt.isSettled && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentForm((f) => ({ ...f, debtId: debt.id }))
                              }}
                              style={{ ...btnGhost, padding: "5px 10px", fontSize: 11 }}
                              title="Ödeme ekle"
                            >
                              Ödeme
                            </button>
                            <button
                              type="button"
                              onClick={() => onSettleDebt(debt.id)}
                              style={{
                                padding: "5px 10px",
                                fontSize: 11,
                                borderRadius: 8,
                                border: "1px solid rgba(78,222,163,0.3)",
                                background: "rgba(78,222,163,0.08)",
                                color: S.green,
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                              title="Kapandı olarak işaretle"
                            >
                              Kapandı
                            </button>
                            <button
                              type="button"
                              onClick={() => editDebt(debt)}
                              style={{ ...btnGhost, padding: "5px 10px", fontSize: 11 }}
                            >
                              Düzenle
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteDebt(debt.id)}
                          style={{ ...btnDanger, padding: "5px 10px", fontSize: 11 }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    {payments.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: S.muted,
                            fontSize: 11,
                            cursor: "pointer",
                            padding: "4px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span style={{ transform: isExpanded ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
                          {payments.length} ödeme geçmişi
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              borderTop: `1px solid ${S.border}`,
                              paddingTop: 8,
                            }}
                          >
                            {payments.map((p) => (
                              <div
                                key={p.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 12,
                                  color: S.sub,
                                }}
                              >
                                <span>{new Date(p.paymentDate + "T12:00:00").toLocaleDateString("tr-TR")}{p.note ? ` · ${p.note}` : ""}</span>
                                <span className="finance-number" style={{ color: S.green, fontWeight: 700 }}>
                                  +{TRY(p.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
