import { useMemo, useState } from "react"

import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { today, TRY } from "../../utils/helpers"

const SUGGESTIONS = ["Netflix", "Spotify", "Kira", "Sigorta", "Telefon", "Internet", "Aidat", "Bulut Depolama"]

export default function Subscriptions({ cats, rules, onSaveRule, onCreateFromRule }) {
  const expenseCats = cats.filter((cat) => !cat.isIncome && !cat.isArchived)
  const defaultCat = expenseCats[0]?.id || ""
  const [form, setForm] = useState({
    name: "",
    amount: "",
    cat: defaultCat,
    frequency: "monthly",
    nextDate: today(),
    paymentMethod: "Kart",
  })

  const subscriptions = useMemo(
    () => rules.filter((rule) => rule.isActive && rule.type === "expense").sort((a, b) => a.nextDate.localeCompare(b.nextDate)),
    [rules]
  )
  const monthlyTotal = subscriptions.reduce((total, rule) => total + monthlyEquivalent(rule), 0)

  const save = () => {
    const categoryId = form.cat || defaultCat
    if (!form.name || !form.amount || !categoryId) return
    onSaveRule({
      name: form.name,
      type: "expense",
      amount: parseFloat(form.amount) || 0,
      cat: categoryId,
      frequency: form.frequency,
      dayOfMonth: Number(form.nextDate.slice(-2)) || 1,
      nextDate: form.nextDate || today(),
      desc: `${form.name} aboneliği`,
      paymentMethod: form.paymentMethod,
      isActive: true,
    })
    setForm({ name: "", amount: "", cat: categoryId, frequency: "monthly", nextDate: today(), paymentMethod: "Kart" })
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        <Card>
          <FieldLabel>Aktif Abonelik</FieldLabel>
          <div className="finance-number" style={{ color: S.green, fontFamily: FONT_MONO, fontSize: 24, fontWeight: 800 }}>{subscriptions.length}</div>
        </Card>
        <Card>
          <FieldLabel>Aylık Etki</FieldLabel>
          <div className="finance-number" style={{ color: S.rose, fontFamily: FONT_MONO, fontSize: 24, fontWeight: 800 }}>{TRY(monthlyTotal)}</div>
        </Card>
        <Card>
          <FieldLabel>Yıllık Tahmin</FieldLabel>
          <div className="finance-number" style={{ color: S.cyan, fontFamily: FONT_MONO, fontSize: 24, fontWeight: 800 }}>{TRY(monthlyTotal * 12)}</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 12 }}>
        <Card>
          <FieldLabel>Yeni Abonelik</FieldLabel>
          <div style={{ display: "grid", gap: 10 }}>
            <input placeholder="Netflix, Spotify, kira..." value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((name) => (
                <button key={name} type="button" onClick={() => setForm((p) => ({ ...p, name }))} style={{ ...btnGhost, padding: "6px 9px", fontSize: 11 }}>
                  {name}
                </button>
              ))}
            </div>
            <input type="number" min="0" placeholder="Tutar" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} style={inputStyle} />
            <select value={form.cat || defaultCat} onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))} style={inputStyle}>
              <option value="">Kategori seç...</option>
              {expenseCats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} style={inputStyle}>
                <option value="monthly">Aylık</option>
                <option value="weekly">Haftalık</option>
              </select>
              <input type="date" value={form.nextDate} onChange={(e) => setForm((p) => ({ ...p, nextDate: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={save} style={btnPrimary}>Abonelik Ekle</button>
          </div>
        </Card>

        <Card>
          <FieldLabel>Abonelik Takibi</FieldLabel>
          {subscriptions.length === 0 ? (
            <EmptyState
              icon="↻"
              title="Henüz abonelik yok"
              text="Netflix, Spotify, kira veya sigorta gibi düzenli giderleri ekleyerek ay sonu nakit akışını önceden görün."
              framed={false}
            />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {subscriptions.map((rule) => (
                <div key={rule.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", border: `1px solid ${S.border}`, borderRadius: 8, padding: 12 }}>
                  <div>
                    <div style={{ color: S.text, fontWeight: 800 }}>{rule.name}</div>
                    <div style={{ color: S.muted, fontSize: 12 }}>
                      {rule.frequency === "monthly" ? "Aylık" : "Haftalık"} · sıradaki: {rule.nextDate}
                    </div>
                  </div>
                  <div className="finance-number" style={{ color: S.rose, fontFamily: FONT_MONO, fontWeight: 800 }}>
                    -{TRY(rule.amount)}
                  </div>
                  <button onClick={() => onCreateFromRule(rule)} style={{ ...btnGhost, padding: "7px 10px", fontSize: 12 }}>
                    Kayda Düş
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function monthlyEquivalent(rule) {
  return rule.frequency === "weekly" ? rule.amount * 4.33 : rule.amount
}
