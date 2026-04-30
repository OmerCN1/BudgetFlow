import { useMemo, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_MONO, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { today, TRY } from "../../utils/helpers"

export default function RecurringRules({ cats, rules, onSaveRule, onCreateFromRule }) {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    amount: "",
    cat: "",
    frequency: "monthly",
    dayOfMonth: "1",
    nextDate: today(),
    desc: "",
    paymentMethod: "Kart",
  })

  const availCats = useMemo(
    () => cats.filter((cat) => !cat.isArchived && (form.type === "income" ? cat.isIncome : !cat.isIncome)),
    [cats, form.type]
  )

  const save = () => {
    if (!form.name || !form.amount || !form.cat) return
    onSaveRule({
      ...form,
      amount: parseFloat(form.amount) || 0,
      dayOfMonth: parseInt(form.dayOfMonth, 10) || 1,
      isActive: true,
    })
    setForm({
      name: "",
      type: "expense",
      amount: "",
      cat: "",
      frequency: "monthly",
      dayOfMonth: "1",
      nextDate: today(),
      desc: "",
      paymentMethod: "Kart",
    })
  }

  return (
    <div className="recurring-editor-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 10, marginTop: 12 }}>
      <Card>
        <FieldLabel>Tekrarlı İşlem Şablonu</FieldLabel>
        <div style={{ display: "grid", gap: 8 }}>
          <input placeholder="Örn. Kira, Maaş, Netflix" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value, cat: "" }))} style={inputStyle}>
              <option value="expense">Gider</option>
              <option value="income">Gelir</option>
            </select>
            <input type="number" min="0" placeholder="Tutar" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} style={inputStyle} />
          </div>
          <select value={form.cat} onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))} style={inputStyle}>
            <option value="">Kategori seç...</option>
            {availCats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} style={inputStyle}>
              <option value="monthly">Aylık</option>
              <option value="weekly">Haftalık</option>
            </select>
            <input type="date" value={form.nextDate} onChange={(e) => setForm((p) => ({ ...p, nextDate: e.target.value }))} style={inputStyle} />
          </div>
          <input placeholder="Açıklama" value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} style={inputStyle} />
          <button onClick={save} style={btnPrimary}>Şablon Ekle</button>
        </div>
      </Card>

      <Card>
        <FieldLabel>Yaklaşan Ödemeler ve Gelirler</FieldLabel>
        <div style={{ display: "grid", gap: 8 }}>
          {rules.filter((rule) => rule.isActive).length === 0 && (
            <div style={{ color: S.muted, fontSize: 13 }}>Henüz tekrarlı işlem yok.</div>
          )}
          {rules.filter((rule) => rule.isActive).map((rule) => {
            const daysUntil = rule.nextDate ? Math.ceil((new Date(rule.nextDate) - new Date()) / 86400000) : null
            const isSoon = daysUntil !== null && daysUntil <= 7
            return (
              <div
                key={rule.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                  border: `1px solid ${S.border}`,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{ color: S.text, fontWeight: 800, fontSize: 13 }}>{rule.name}</span>
                    <span className={`next-payment-badge ${isSoon ? "is-soon" : "is-normal"}`}>
                      {daysUntil === 0 ? "Bugün" : daysUntil === 1 ? "Yarın" : rule.nextDate}
                    </span>
                  </div>
                  <div style={{ color: S.muted, fontSize: 11 }}>{rule.frequency === "monthly" ? "Aylık" : "Haftalık"}</div>
                </div>
                <div style={{ color: rule.type === "income" ? S.green : S.red, fontFamily: FONT_MONO, fontWeight: 800 }}>
                  {rule.type === "income" ? "+" : "-"}{TRY(rule.amount)}
                </div>
                <button onClick={() => onCreateFromRule(rule)} style={{ ...btnGhost, padding: "6px 10px", fontSize: 12 }}>
                  Bu ay oluştur
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

