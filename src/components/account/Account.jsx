import { useEffect, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { supabase } from "../../lib/supabase"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function Account({ user, profile, txs, cats, balance, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(profile?.monthly_income_target || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setDisplayName(profile?.display_name || "")
    setMonthlyIncomeTarget(profile?.monthly_income_target || "")
  }, [profile?.display_name, profile?.monthly_income_target])

  const saveProfile = async () => {
    setSaving(true)
    setError("")
    setMessage("")

    try {
      await onProfileUpdate({
        display_name: displayName || null,
        monthly_income_target: parseFloat(monthlyIncomeTarget) || 0,
      })
      setMessage("Profil güncellendi.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
        }}
      >
        {[
          { label: "Net Bakiye", value: TRY(balance), color: balance >= 0 ? S.green : S.red },
          { label: "Toplam Gelir", value: TRY(income), color: S.green },
          { label: "Toplam Gider", value: TRY(expense), color: S.red },
          { label: "Kategori", value: cats.length, color: S.sub },
        ].map((item) => (
          <Card key={item.label}>
            <FieldLabel>{item.label}</FieldLabel>
            <div style={{ fontFamily: FONT_MONO, color: item.color, fontWeight: 800, fontSize: 18 }}>
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ color: S.text, fontWeight: 800, fontSize: 18 }}>Hesap</div>
            <div style={{ color: S.muted, fontSize: 12, fontFamily: FONT_BODY }}>{user.email}</div>
          </div>
          <button onClick={signOut} style={btnGhost}>
            Çıkış Yap
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto", gap: 10, marginTop: 18 }}>
          <div>
            <FieldLabel>Görünen Ad</FieldLabel>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Adınız"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel>Aylık Gelir Hedefi</FieldLabel>
            <input
              type="number"
              min="0"
              value={monthlyIncomeTarget}
              onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{ ...btnPrimary, alignSelf: "end", opacity: saving ? 0.7 : 1 }}
          >
            Kaydet
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, color: S.muted, fontSize: 12 }}>
          <span>Para birimi: {profile?.currency || "TRY"}</span>
          <span>Seed: {profile?.seeded_at ? "Tamamlandı" : "Bekliyor"}</span>
          <span>Kullanıcı ID: {user.id.slice(0, 8)}...</span>
        </div>

        {error && <div style={{ color: S.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
        {message && <div style={{ color: S.green, fontSize: 12, marginTop: 10 }}>{message}</div>}
      </Card>
    </div>
  )
}
