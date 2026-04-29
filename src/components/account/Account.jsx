import { useEffect, useMemo, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { supabase } from "../../lib/supabase"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

const compactDateTime = (dateValue) =>
  dateValue
    ? new Date(dateValue).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Henüz yok"

const initialsFor = (name, email) =>
  (name || email || "BF")
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

export default function Account({ user, profile, txs, cats, balance, onProfileUpdate, onOpenPlans }) {
  const fallbackName = user?.email?.split("@")[0] || "BudgetFlow"
  const [displayName, setDisplayName] = useState(profile?.display_name || fallbackName)
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(profile?.monthly_income_target || "")
  const [currency, setCurrency] = useState(profile?.currency || "TRY")
  const [locale, setLocale] = useState(profile?.locale || "tr-TR")
  const [timezone, setTimezone] = useState(profile?.timezone || "Europe/Istanbul")
  const [twoFactor, setTwoFactor] = useState(Boolean(profile?.two_factor_enabled))
  const [emailNotif, setEmailNotif] = useState(profile?.notification_email !== false)
  const [pushNotif, setPushNotif] = useState(profile?.notification_push !== false)
  const [smsNotif, setSmsNotif] = useState(Boolean(profile?.notification_sms))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setDisplayName(profile?.display_name || fallbackName)
    setMonthlyIncomeTarget(profile?.monthly_income_target || "")
    setCurrency(profile?.currency || "TRY")
    setLocale(profile?.locale || "tr-TR")
    setTimezone(profile?.timezone || "Europe/Istanbul")
    setTwoFactor(Boolean(profile?.two_factor_enabled))
    setEmailNotif(profile?.notification_email !== false)
    setPushNotif(profile?.notification_push !== false)
    setSmsNotif(Boolean(profile?.notification_sms))
  }, [fallbackName, profile])

  const income = useMemo(() => txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [txs])
  const expense = useMemo(() => txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [txs])
  const expenseRatio = income > 0 ? Math.min((expense / income) * 100, 100) : 0
  const activeCategories = cats.filter((cat) => !cat.isArchived)
  const customerNo = `BF-${String(user?.id || "000000").replace(/\D/g, "").slice(0, 6).padEnd(6, "0")}`
  const accountAge = profile?.created_at ? compactDateTime(profile.created_at) : "Yeni hesap"
  const initials = initialsFor(displayName, user?.email)

  const saveProfile = async () => {
    setSaving(true)
    setError("")
    setMessage("")

    try {
      await onProfileUpdate({
        display_name: displayName || null,
        monthly_income_target: parseFloat(monthlyIncomeTarget) || 0,
        currency,
        locale,
        timezone,
        two_factor_enabled: twoFactor,
        notification_email: emailNotif,
        notification_push: pushNotif,
        notification_sms: smsNotif,
      })
      setMessage("Profil güncellendi.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const exportCsv = () => {
    const rows = [
      ["Tarih", "Tip", "Tutar", "Aciklama"],
      ...txs.map((tx) => [tx.date, tx.type, tx.amount, tx.desc || ""]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "budgetflow-islemler.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="account-page">
      <section className="account-hero">
        <div className="account-identity">
          <div className="account-avatar account-avatar-glow">
            <span>{initials}</span>
            <b>✓</b>
          </div>
          <div>
            <div className="account-title-row">
              <h1>{displayName || "Hesabım"}</h1>
              <span>Premium Üye</span>
            </div>
            <p>{user?.email}</p>
            <small>Müşteri No: #{customerNo}</small>
          </div>
        </div>
        <div className="account-hero-actions">
          <button onClick={exportCsv} style={btnGhost}>Verileri Dışa Aktar</button>
          <button onClick={saveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Kaydediliyor" : "Düzenle"}
          </button>
        </div>
      </section>

      <section className="account-stat-grid">
        {[
          { label: "Net Bakiye", value: TRY(balance), tone: balance >= 0 ? S.green : S.red },
          { label: "Toplam Gelir", value: TRY(income), tone: S.green },
          { label: "Toplam Gider", value: TRY(expense), tone: S.rose },
          { label: "Aktif Kategori", value: activeCategories.length, tone: S.cyan },
        ].map((item) => (
          <Card key={item.label}>
            <FieldLabel>{item.label}</FieldLabel>
            <div className="finance-number account-stat-value" style={{ color: item.tone }}>{item.value}</div>
          </Card>
        ))}
      </section>

      <section className="account-bento">
        <div className="account-main-column">
          <Card>
            <SectionTitle icon="▣" title="Kişisel Bilgiler" />
            <div className="account-form-grid">
              <LabeledInput label="Tam Ad">
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Adınız" style={inputStyle} />
              </LabeledInput>
              <LabeledInput label="E-posta Adresi">
                <input value={user?.email || ""} readOnly style={{ ...inputStyle, color: S.muted }} />
              </LabeledInput>
              <LabeledInput label="Aylık Gelir Hedefi">
                <input
                  type="number"
                  min="0"
                  value={monthlyIncomeTarget}
                  onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </LabeledInput>
              <LabeledInput label="Hesap Açılışı">
                <input value={accountAge} readOnly style={{ ...inputStyle, color: S.muted }} />
              </LabeledInput>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="◆" title="Güvenlik ve Şifre" />
            <div className="account-action-list">
              <ActionRow icon="●" title="Şifre Değiştir" text="Supabase oturum güvenliği aktif" action="›" />
              <div className="account-action-row">
                <div className="account-action-copy">
                  <span>▥</span>
                  <div>
                    <strong>İki Faktörlü Kimlik Doğrulama</strong>
                    <small>{twoFactor ? "Ek güvenlik açık" : "Ek güvenlik kapalı"}</small>
                  </div>
                </div>
                <Switch checked={twoFactor} onChange={setTwoFactor} />
              </div>
            </div>
            <FieldLabel>Son Giriş Hareketleri</FieldLabel>
            <div className="account-login-list">
              <LoginRow device="macOS Sonoma • Chrome" meta="Bugün • İstanbul, TR" />
              <LoginRow device="Mobil tarayıcı • BudgetFlow" meta="Dün • İstanbul, TR" />
            </div>
          </Card>

          <Card>
            <SectionTitle icon="▤" title="Bağlı Hesaplar" />
            <div className="account-bank-grid">
              {[
                { name: "Ana Cüzdan", status: "Senkronize", color: S.green, letter: "A" },
                { name: "Kart Harcamaları", status: `${txs.length} işlem`, color: S.cyan, letter: "K" },
                { name: "Nakit Takibi", status: "Manuel kayıt", color: S.amber, letter: "N" },
              ].map((bank) => (
                <div className="account-bank-card" key={bank.name}>
                  <div>
                    <span style={{ background: `${bank.color}20`, color: bank.color }}>{bank.letter}</span>
                    <div>
                      <strong>{bank.name}</strong>
                      <small style={{ color: bank.color }}>{bank.status}</small>
                    </div>
                  </div>
                  <button type="button">↻</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="account-side-column">
          <Card>
            <SectionTitle icon="▰" title="Abonelik" />
            <div className="account-plan-card">
              <small>Aktif Plan</small>
              <strong>Premium</strong>
              <span>BudgetFlow Private</span>
            </div>
            <div className="account-meta-list">
              <MetaRow label="Bir sonraki ödeme" value="12 Haziran 2026" />
              <MetaRow label="Tutar" value="₺149,90 / ay" highlight />
              <MetaRow label="Kullanım oranı" value={`%${Math.round(expenseRatio)}`} />
            </div>
            <button onClick={onOpenPlans} style={{ ...btnGhost, width: "100%", marginTop: 14 }}>Yönet ve Yükselt</button>
          </Card>

          <Card>
            <SectionTitle icon="⚙" title="Tercihler" />
            <div className="account-preference-stack">
              <LabeledInput label="Ana Para Birimi">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                  <option value="TRY">Türk Lirası (TRY)</option>
                  <option value="USD">Amerikan Doları (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </LabeledInput>
              <LabeledInput label="Dil">
                <select value={locale} onChange={(e) => setLocale(e.target.value)} style={inputStyle}>
                  <option value="tr-TR">Türkçe</option>
                  <option value="en-US">English</option>
                </select>
              </LabeledInput>
              <LabeledInput label="Saat Dilimi">
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
                  <option value="Europe/Istanbul">Europe/Istanbul</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </LabeledInput>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="◉" title="Bildirim Ayarları" />
            <div className="account-toggle-stack">
              <ToggleRow title="E-posta Bildirimleri" text="Haftalık özet ve raporlar" checked={emailNotif} onChange={setEmailNotif} />
              <ToggleRow title="Push Bildirimleri" text="Anlık işlem uyarıları" checked={pushNotif} onChange={setPushNotif} />
              <ToggleRow title="SMS Uyarıları" text="Güvenlik ve büyük harcamalar" checked={smsNotif} onChange={setSmsNotif} />
            </div>
          </Card>
        </div>
      </section>

      <section className="account-bottom-actions">
        <button onClick={exportCsv} type="button">↓ Verileri Dışa Aktar (.CSV)</button>
        <button onClick={signOut} type="button">↪ Çıkış Yap</button>
      </section>

      {error && <div className="account-feedback is-error">{error}</div>}
      {message && <div className="account-feedback">{message}</div>}
    </div>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div className="account-section-title">
      <span>{icon}</span>
      <h2>{title}</h2>
    </div>
  )
}

function LabeledInput({ label, children }) {
  return (
    <label className="account-field">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  )
}

function ActionRow({ icon, title, text, action }) {
  return (
    <div className="account-action-row">
      <div className="account-action-copy">
        <span>{icon}</span>
        <div>
          <strong>{title}</strong>
          <small>{text}</small>
        </div>
      </div>
      <b>{action}</b>
    </div>
  )
}

function LoginRow({ device, meta }) {
  return (
    <div className="account-login-row">
      <span>{device}</span>
      <small>{meta}</small>
    </div>
  )
}

function MetaRow({ label, value, highlight }) {
  return (
    <div className="account-meta-row">
      <span>{label}</span>
      <strong style={{ color: highlight ? S.green : S.text }}>{value}</strong>
    </div>
  )
}

function ToggleRow({ title, text, checked, onChange }) {
  return (
    <div className="account-toggle-row">
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

function Switch({ checked, onChange }) {
  return (
    <button
      className={`account-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
      aria-pressed={checked}
    >
      <span />
    </button>
  )
}
