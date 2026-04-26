import { useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnPrimary, PALETTE } from "../../constants/theme"
import { today, TRY } from "../../utils/helpers"

export default function Goals({
  cats,
  catSpend,
  goals = [],
  contributions = [],
  onSaveGoal,
  onAddContribution,
  setView,
}) {
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    color: PALETTE[0],
  })
  const [contributionForm, setContributionForm] = useState({
    goalId: "",
    amount: "",
    date: today(),
    note: "",
  })

  const activeGoals = goals.filter((goal) => !goal.isArchived)
  const goalCats = cats.filter((c) => !c.isIncome && c.budget > 0 && !c.isArchived)
  const overCount = goalCats.filter((c) => (catSpend[c.id] || 0) > c.budget).length

  const saveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return
    onSaveGoal({
      ...goalForm,
      targetAmount: parseFloat(goalForm.targetAmount) || 0,
      currentAmount: parseFloat(goalForm.currentAmount) || 0,
    })
    setGoalForm({ name: "", targetAmount: "", currentAmount: "", targetDate: "", color: PALETTE[0] })
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
          { label: "Toplam Hedef", value: TRY(activeGoals.reduce((s, g) => s + g.targetAmount, 0)), color: S.sub, raw: true },
          { label: "Birikmiş", value: TRY(activeGoals.reduce((s, g) => s + g.currentAmount, 0)), color: S.green, raw: true },
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

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 10 }}>
        <Card>
          <FieldLabel>Yeni Birikim Hedefi</FieldLabel>
          <div style={{ display: "grid", gap: 8 }}>
            <input placeholder="Örn. Acil durum fonu" value={goalForm.name} onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input type="number" min="0" placeholder="Hedef tutar" value={goalForm.targetAmount} onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))} style={inputStyle} />
              <input type="number" min="0" placeholder="Mevcut" value={goalForm.currentAmount} onChange={(e) => setGoalForm((p) => ({ ...p, currentAmount: e.target.value }))} style={inputStyle} />
            </div>
            <input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))} style={inputStyle} />
            <button onClick={saveGoal} style={btnPrimary}>Hedef Ekle</button>
          </div>
        </Card>

        <Card>
          <FieldLabel>Hedefe Katkı Ekle</FieldLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px auto", gap: 8 }}>
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
            return (
              <Card key={goal.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ color: S.text, fontWeight: 800 }}>{goal.name}</div>
                    <div style={{ color: S.muted, fontSize: 11 }}>{goal.targetDate ? `${goal.targetDate} hedef tarihi` : "Tarih yok"}</div>
                  </div>
                  <div style={{ color: S.green, fontFamily: FONT_MONO, fontWeight: 800 }}>{TRY(goal.currentAmount)} / {TRY(goal.targetAmount)}</div>
                </div>
                <div style={{ background: "rgba(187,202,191,0.14)", borderRadius: 20, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: goal.color, borderRadius: 20 }} />
                </div>
                <div style={{ color: S.muted, fontSize: 11, marginTop: 7 }}>%{Math.round(pct)} tamamlandı</div>
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
