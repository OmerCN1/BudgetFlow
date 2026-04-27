import { useMemo, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnPrimary, PALETTE } from "../../constants/theme"
import { today, TRY } from "../../utils/helpers"

const emptyGoalForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  targetDate: "",
  color: PALETTE[0],
}

const GOAL_TEMPLATES = [
  { label: "Acil Fon", name: "Acil durum fonu", amount: 120000, months: 10, color: PALETTE[0] },
  { label: "Tatil", name: "Yaz tatili", amount: 65000, months: 5, color: PALETTE[1] },
  { label: "Borç Kapatma", name: "Kredi kartı kapatma", amount: 45000, months: 4, color: PALETTE[2] },
  { label: "Ev", name: "Ev peşinatı", amount: 500000, months: 24, color: PALETTE[3] },
  { label: "Teknoloji", name: "Yeni bilgisayar", amount: 85000, months: 8, color: PALETTE[5] },
  { label: "Özel", name: "", amount: "", months: 6, color: PALETTE[0] },
]

const dateAfterMonths = (months) => {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toISOString().slice(0, 10)
}

export default function Goals({
  cats,
  catSpend,
  goals = [],
  contributions = [],
  onSaveGoal,
  onDeleteGoal,
  onAddContribution,
  setView,
}) {
  const [goalForm, setGoalForm] = useState(emptyGoalForm)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [contributionForm, setContributionForm] = useState({
    goalId: "",
    amount: "",
    date: today(),
    note: "",
  })

  const activeGoals = goals.filter((goal) => !goal.isArchived)
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalRemaining = Math.max(totalTarget - totalSaved, 0)
  const goalCats = cats.filter((c) => !c.isIncome && c.budget > 0 && !c.isArchived)
  const overCount = goalCats.filter((c) => (catSpend[c.id] || 0) > c.budget).length
  const recentContributions = useMemo(
    () => contributions.slice(0, 5).map((item) => ({
      ...item,
      goalName: goals.find((goal) => goal.id === item.goalId)?.name || "Hedef",
    })),
    [contributions, goals]
  )

  const applyTemplate = (template) => {
    setEditingGoalId(null)
    setGoalForm({
      name: template.name,
      targetAmount: String(template.amount || ""),
      currentAmount: "",
      targetDate: dateAfterMonths(template.months),
      color: template.color,
    })
  }

  const editGoal = (goal) => {
    setEditingGoalId(goal.id)
    setGoalForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount || ""),
      currentAmount: String(goal.currentAmount || ""),
      targetDate: goal.targetDate || "",
      color: goal.color || PALETTE[0],
    })
  }

  const resetGoalForm = () => {
    setEditingGoalId(null)
    setGoalForm(emptyGoalForm)
  }

  const saveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return
    onSaveGoal({
      ...goalForm,
      targetAmount: parseFloat(goalForm.targetAmount) || 0,
      currentAmount: parseFloat(goalForm.currentAmount) || 0,
    }, editingGoalId)
    resetGoalForm()
  }

  const deleteGoal = (goal) => {
    if (!onDeleteGoal) return
    const ok = window.confirm(`${goal.name} hedefi kaldırılacak. Geçmiş katkı kayıtları korunur.`)
    if (ok) onDeleteGoal(goal.id)
  }

  const saveContribution = () => {
    if (!contributionForm.goalId || !contributionForm.amount) return
    onAddContribution({
      ...contributionForm,
      amount: parseFloat(contributionForm.amount) || 0,
    })
    setContributionForm({ goalId: "", amount: "", date: today(), note: "" })
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        {[
          { label: "Birikim Hedefi", value: activeGoals.length, unit: "hedef", color: S.green },
          { label: "Aşılan Bütçe", value: overCount, unit: "kategori", color: overCount > 0 ? S.red : S.green },
          { label: "Toplam Hedef", value: TRY(totalTarget), color: S.sub, raw: true },
          { label: "Kalan Tutar", value: TRY(totalRemaining), color: totalRemaining > 0 ? S.amber : S.green, raw: true },
        ].map((stat) => (
          <Card key={stat.label}>
            <FieldLabel>{stat.label}</FieldLabel>
            <div style={{ fontFamily: stat.raw ? FONT_BODY : FONT_MONO, fontSize: stat.raw ? 16 : 22, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            {stat.unit && <div style={{ color: S.muted, fontSize: 11 }}>{stat.unit}</div>}
          </Card>
        ))}
      </div>

      <div className="goals-editor-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 10 }}>
        <Card>
          <FieldLabel>{editingGoalId ? "Hedefi Düzenle" : "Kişisel Hedef Oluştur"}</FieldLabel>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {GOAL_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  onClick={() => applyTemplate(template)}
                  style={{
                    ...btnGhost,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: goalForm.name === template.name && template.name ? S.green : S.sub,
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <input placeholder="Hedef adı yazın" value={goalForm.name} onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input type="number" min="0" placeholder="Hedef tutar" value={goalForm.targetAmount} onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))} style={inputStyle} />
              <input type="number" min="0" placeholder="Mevcut" value={goalForm.currentAmount} onChange={(e) => setGoalForm((p) => ({ ...p, currentAmount: e.target.value }))} style={inputStyle} />
            </div>
            <input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))} style={inputStyle} />
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PALETTE.slice(0, 8).map((color) => (
                <button
                  key={color}
                  onClick={() => setGoalForm((p) => ({ ...p, color }))}
                  aria-label={`Renk ${color}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: goalForm.color === color ? `2px solid ${S.text}` : `1px solid ${S.border}`,
                    background: color,
                    cursor: "pointer",
                    boxShadow: goalForm.color === color ? `0 0 0 3px ${color}30` : "none",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {editingGoalId && <button onClick={resetGoalForm} style={{ ...btnGhost, flex: 1 }}>Vazgeç</button>}
              <button onClick={saveGoal} style={{ ...btnPrimary, flex: 1 }}>{editingGoalId ? "Güncelle" : "Hedef Ekle"}</button>
            </div>
          </div>
        </Card>

        <Card>
          <FieldLabel>Hedefe Katkı Ekle</FieldLabel>
          <div className="goal-contribution-grid" style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px auto", gap: 8 }}>
            <select value={contributionForm.goalId} onChange={(e) => setContributionForm((p) => ({ ...p, goalId: e.target.value }))} style={inputStyle}>
              <option value="">Hedef seç...</option>
              {activeGoals.map((goal) => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
            </select>
            <input type="number" min="0" placeholder="Tutar" value={contributionForm.amount} onChange={(e) => setContributionForm((p) => ({ ...p, amount: e.target.value }))} style={inputStyle} />
            <input type="date" value={contributionForm.date} onChange={(e) => setContributionForm((p) => ({ ...p, date: e.target.value }))} style={inputStyle} />
            <button onClick={saveContribution} style={btnGhost}>Ekle</button>
          </div>
          <div style={{ color: S.muted, fontSize: 12, marginTop: 10 }}>
            Toplam {contributions.length} katkı kaydı.
          </div>
          {recentContributions.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {recentContributions.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: S.sub, fontSize: 12 }}>
                  <span>{item.goalName} · {item.date}</span>
                  <span className="finance-number" style={{ color: S.green }}>{TRY(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {activeGoals.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
          <div style={{ color: S.text, fontWeight: 700, marginBottom: 6 }}>Henüz birikim hedefi yok</div>
          <div style={{ color: S.muted, fontSize: 13, marginBottom: 16 }}>Acil durum fonu, tatil veya borç kapatma gibi hedefler oluşturun.</div>
          <button onClick={() => setView("transactions")} style={btnPrimary}>İlk Hedefi Planla</button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {activeGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
            const daysLeft = goal.targetDate ? Math.max(Math.ceil((new Date(goal.targetDate) - new Date(today())) / 86400000), 0) : null
            const monthlyNeeded = daysLeft && remaining > 0 ? remaining / Math.max(Math.ceil(daysLeft / 30), 1) : 0
            return (
              <Card key={goal.id}>
                <div className="goal-card-head" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ color: S.text, fontWeight: 800, fontSize: 16 }}>{goal.name}</div>
                    <div style={{ color: S.muted, fontSize: 11 }}>{goal.targetDate ? `${goal.targetDate} hedef tarihi` : "Esnek tarih"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ color: S.green, fontFamily: FONT_MONO, fontWeight: 800, textAlign: "right" }}>{TRY(goal.currentAmount)} / {TRY(goal.targetAmount)}</div>
                    <button onClick={() => editGoal(goal)} style={{ ...btnGhost, padding: "7px 9px", fontSize: 11 }}>Düzenle</button>
                    <button onClick={() => deleteGoal(goal)} style={{ ...btnGhost, padding: "7px 9px", fontSize: 11, color: S.rose, borderColor: "rgba(244,63,94,0.28)" }}>Kaldır</button>
                  </div>
                </div>
                <div style={{ background: "rgba(187,202,191,0.14)", borderRadius: 20, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: goal.color, borderRadius: 20 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginTop: 12 }}>
                  {[
                    { label: "Tamamlanma", value: `%${Math.round(pct)}` },
                    { label: "Kalan", value: TRY(remaining) },
                    { label: "Süre", value: daysLeft === null ? "Esnek" : `${daysLeft} gün` },
                    { label: "Aylık gerekli", value: monthlyNeeded > 0 ? TRY(monthlyNeeded) : "Hazır" },
                  ].map((item) => (
                    <div key={item.label} style={{ border: `1px solid ${S.border}`, borderRadius: 8, padding: 10, background: "rgba(9,16,12,0.42)" }}>
                      <div style={{ color: S.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{item.label}</div>
                      <div className="finance-number" style={{ color: S.text, fontSize: 12, fontWeight: 800, marginTop: 3 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {goalCats.length > 0 && (
        <Card>
          <FieldLabel>Kategori Bütçe Durumu</FieldLabel>
          <div style={{ display: "grid", gap: 10 }}>
            {goalCats.map((c) => {
              const spent = catSpend[c.id] || 0
              const pct = Math.min((spent / c.budget) * 100, 100)
              const over = spent > c.budget
              return (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: S.text }}>{c.name}</span>
                    <span style={{ color: over ? S.red : S.sub }}>{TRY(spent)} / {TRY(c.budget)}</span>
                  </div>
                  <div style={{ background: "rgba(187,202,191,0.14)", borderRadius: 20, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: over ? S.red : c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
