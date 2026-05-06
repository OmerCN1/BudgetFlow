import { useEffect, useMemo, useRef, useState } from "react"

import Card from "../ui/Card"
import FieldLabel from "../ui/FieldLabel"
import { supabase } from "../../lib/supabase"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"
import { sendNotification, loadNotificationLogs } from "../../services/notificationService"

const compactDateTime = (dateValue) =>
  dateValue
    ? new Date(dateValue).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Henüz yok"

const initialsFor = (name, email) =>
  (name || email || "BA")
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

const PLAN_META = {
  free: {
    name: "Ücretsiz",
    label: "Ücretsiz Üye",
    product: "BudgetAssist Free",
    monthly: 0,
  },
  standard: {
    name: "Standart",
    label: "Standart Üye",
    product: "BudgetAssist Standard",
    monthly: 49,
  },
  premium: {
    name: "Premium",
    label: "Premium Üye",
    product: "BudgetAssist Private",
    monthly: 149,
  },
}

export default function Account({ user, profile, txs, cats, balance, subscription, onProfileUpdate, onAvatarUpload, onGetAvatarUrl, onOpenPlans }) {
  const avatarInputRef = useRef(null)
  const fallbackName = user?.email?.split("@")[0] || "BudgetAssist"
  const [displayName, setDisplayName] = useState(profile?.display_name || fallbackName)
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(profile?.monthly_income_target || "")
  const [currency, setCurrency] = useState(profile?.currency || "TRY")
  const [locale, setLocale] = useState(profile?.locale || "tr-TR")
  const [timezone, setTimezone] = useState(profile?.timezone || "Europe/Istanbul")
  const [twoFactor, setTwoFactor] = useState(Boolean(profile?.two_factor_enabled))
  const [emailNotif, setEmailNotif] = useState(profile?.notification_email !== false)
  const [pushNotif, setPushNotif] = useState(profile?.notification_push !== false)
  const [smsNotif, setSmsNotif] = useState(Boolean(profile?.notification_sms))
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [mfaFactors, setMfaFactors] = useState([])
  const [mfaEnroll, setMfaEnroll] = useState(null)
  const [mfaCode, setMfaCode] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [sendingNotif, setSendingNotif] = useState(false)
  const [notifLogs, setNotifLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)

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
    setPhoneNumber(profile?.phone_number || "")
  }, [fallbackName, profile])

  useEffect(() => {
    let cancelled = false
    if (!profile?.avatar_url || !onGetAvatarUrl) {
      setAvatarUrl("")
      return () => { cancelled = true }
    }
    onGetAvatarUrl(profile.avatar_url)
      .then((url) => {
        if (!cancelled) setAvatarUrl(url || "")
      })
      .catch(() => {
        if (!cancelled) setAvatarUrl("")
      })
    return () => { cancelled = true }
  }, [profile?.avatar_url, onGetAvatarUrl])

  useEffect(() => {
    loadSecurityState()
  }, [user?.id])

  const income = useMemo(() => txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [txs])
  const expense = useMemo(() => txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [txs])
  const expenseRatio = income > 0 ? Math.min((expense / income) * 100, 100) : 0
  const activeCategories = cats.filter((cat) => !cat.isArchived)
  const customerNo = `BA-${String(user?.id || "000000").replace(/\D/g, "").slice(0, 6).padEnd(6, "0")}`
  const accountAge = profile?.created_at ? compactDateTime(profile.created_at) : "Yeni hesap"
  const initials = initialsFor(displayName, user?.email)
  const activePlan = PLAN_META[subscription?.planId || "free"] || PLAN_META.free
  const billingInterval = subscription?.billingInterval || "monthly"
  const planPrice = billingInterval === "yearly"
    ? Math.round(activePlan.monthly * 0.8)
    : activePlan.monthly
  const nextPayment = activePlan.monthly > 0 && subscription?.currentPeriodEnd
    ? compactDateTime(subscription.currentPeriodEnd)
    : "Ödeme yok"
  const planStatus = statusLabel(subscription?.status || "active")

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
        phone_number: phoneNumber || null,
      })
      setMessage("Profil güncellendi.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const loadSecurityState = async () => {
    if (!user?.id) return
    setSecurityLoading(true)
    try {
      const [{ data: sessionData }, factorsResult] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.mfa?.listFactors ? supabase.auth.mfa.listFactors() : Promise.resolve({ data: { all: [] } }),
      ])
      const factors = factorsResult?.data?.all || factorsResult?.data?.totp || []
      setSessionInfo(sessionData?.session || null)
      setMfaFactors(factors)
      const hasVerifiedTotp = factors.some((factor) => factor.factor_type === "totp" && factor.status === "verified")
      setTwoFactor(hasVerifiedTotp)
    } catch {
      setSessionInfo(null)
      setMfaFactors([])
    } finally {
      setSecurityLoading(false)
    }
  }

  const startMfaEnroll = async () => {
    setSecurityLoading(true)
    setError("")
    setMessage("")
    try {
      if (!supabase.auth.mfa?.enroll) throw new Error("Supabase MFA istemcisi bu ortamda kullanılamıyor.")
      const factorsResult = await supabase.auth.mfa.listFactors()
      const factors = factorsResult?.data?.all || factorsResult?.data?.totp || []
      const verifiedTotp = factors.find((factor) => factor.factor_type === "totp" && factor.status === "verified")
      if (verifiedTotp) {
        setTwoFactor(true)
        setMessage("İki faktörlü kimlik doğrulama zaten etkin.")
        return
      }

      const staleBudgetAssistFactors = factors.filter((factor) =>
        factor.factor_type === "totp" &&
        factor.status !== "verified" &&
        String(factor.friendly_name || "").startsWith("BudgetAssist Authenticator")
      )
      for (const factor of staleBudgetAssistFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `BudgetAssist Authenticator ${new Date().toISOString().slice(0, 19)}`,
      })
      if (enrollError) throw enrollError
      setMfaEnroll(data)
      setMessage("QR kodu authenticator uygulamanıza okutun ve 6 haneli kodu girin.")
    } catch (err) {
      setError(err.message || "2FA başlatılamadı.")
    } finally {
      setSecurityLoading(false)
    }
  }

  const verifyMfaEnroll = async () => {
    if (!mfaEnroll?.id || !mfaCode.trim()) return
    setSecurityLoading(true)
    setError("")
    setMessage("")
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaEnroll.id })
      if (challengeError) throw challengeError
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnroll.id,
        challengeId: challenge.id,
        code: mfaCode.trim(),
      })
      if (verifyError) throw verifyError
      await onProfileUpdate?.({ two_factor_enabled: true })
      setMfaEnroll(null)
      setMfaCode("")
      setTwoFactor(true)
      setMessage("İki faktörlü kimlik doğrulama etkinleştirildi.")
      await loadSecurityState()
    } catch (err) {
      setError(err.message || "2FA kodu doğrulanamadı.")
    } finally {
      setSecurityLoading(false)
    }
  }

  const disableMfa = async () => {
    const verified = mfaFactors.filter((factor) => factor.factor_type === "totp" && factor.status === "verified")
    if (verified.length === 0) return
    setSecurityLoading(true)
    setError("")
    setMessage("")
    try {
      for (const factor of verified) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (unenrollError) throw unenrollError
      }
      await onProfileUpdate?.({ two_factor_enabled: false })
      setTwoFactor(false)
      setMessage("İki faktörlü kimlik doğrulama kapatıldı.")
      await loadSecurityState()
    } catch (err) {
      setError(err.message || "2FA kapatılamadı.")
    } finally {
      setSecurityLoading(false)
    }
  }

  const uploadAvatar = async (file) => {
    if (!file || !onAvatarUpload) return
    setAvatarSaving(true)
    setError("")
    setMessage("")
    const previewUrl = URL.createObjectURL(file)
    setAvatarUrl(previewUrl)
    try {
      await onAvatarUpload(file)
      setMessage("Profil görseli güncellendi.")
    } catch (err) {
      setError(err.message || "Profil görseli güncellenemedi.")
      setAvatarUrl("")
    } finally {
      URL.revokeObjectURL(previewUrl)
      setAvatarSaving(false)
    }
  }

  const triggerNotification = async (type) => {
    setSendingNotif(true)
    setError("")
    setMessage("")
    try {
      const result = await sendNotification(user.id, type)
      const emailSent = Object.values(result?.results || {}).some((r) => r?.email?.sent)
      const smsSent = Object.values(result?.results || {}).some((r) => r?.sms?.sent)
      const parts = []
      if (emailSent) parts.push("e-posta")
      if (smsSent) parts.push("SMS")
      setMessage(parts.length > 0 ? `${parts.join(" ve ")} gönderildi.` : "Kritik bildirim yok veya bildirim kanalı etkinleştirilmedi.")
    } catch (err) {
      setError(`Bildirim gönderilemedi: ${err.message}`)
    } finally {
      setSendingNotif(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const logs = await loadNotificationLogs(user.id)
      setNotifLogs(logs)
      setShowLogs(true)
    } catch (err) {
      setError("Loglar yüklenemedi.")
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
    link.download = "budgetassist-islemler.csv"
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
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
            <b>✓</b>
          </div>
          <div>
            <div className="account-title-row">
              <h1>{displayName || "Hesabım"}</h1>
              <span>{activePlan.label}</span>
            </div>
            <p>{user?.email}</p>
            <small>Müşteri No: #{customerNo}</small>
          </div>
        </div>
        <div className="account-hero-actions">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              await uploadAvatar(file)
              event.target.value = ""
            }}
            style={{ display: "none" }}
          />
          <button onClick={() => avatarInputRef.current?.click()} disabled={avatarSaving} style={btnGhost}>
            {avatarSaving ? "Yükleniyor" : "Avatar Güncelle"}
          </button>
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
                    <small>{twoFactor ? "Supabase MFA etkin" : "Authenticator uygulamasıyla etkinleştirilebilir"}</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={twoFactor ? disableMfa : startMfaEnroll}
                  disabled={securityLoading}
                  style={{ ...btnGhost, padding: "8px 12px", fontSize: 12 }}
                >
                  {securityLoading ? "Kontrol" : twoFactor ? "Kapat" : "Etkinleştir"}
                </button>
              </div>
              {mfaEnroll && (
                <div className="account-action-row" style={{ alignItems: "flex-start" }}>
                  <div className="account-action-copy" style={{ alignItems: "flex-start" }}>
                    <span>2F</span>
                    <div>
                      <strong>Authenticator Kurulumu</strong>
                      <small>QR kodu okutun, sonra 6 haneli kodu girin.</small>
                      {mfaEnroll.totp?.qr_code && <QrCodeBox value={mfaEnroll.totp.qr_code} />}
                      {mfaEnroll.totp?.uri && (
                        <details style={{ marginTop: 10 }}>
                          <summary style={{ color: S.muted, cursor: "pointer", fontSize: 12 }}>Manuel kurulum anahtarı</summary>
                          <small
                            style={{
                              display: "block",
                              marginTop: 8,
                              maxWidth: 360,
                              color: S.sub,
                              fontFamily: FONT_MONO,
                              fontSize: 10,
                              lineHeight: 1.5,
                              wordBreak: "break-all",
                            }}
                          >
                            {mfaEnroll.totp.uri}
                          </small>
                        </details>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 8, minWidth: 150 }}>
                    <input
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      style={inputStyle}
                    />
                    <button type="button" onClick={verifyMfaEnroll} style={btnPrimary}>Doğrula</button>
                  </div>
                </div>
              )}
            </div>
            <FieldLabel>Son Giriş Hareketleri</FieldLabel>
            <div className="account-login-list">
              <LoginRow device={sessionDeviceLabel(sessionInfo)} meta={sessionMetaLabel(sessionInfo, user)} />
              <LoginRow device="Kimlik Sağlayıcı" meta={identityProviderLabel(user)} />
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
              <strong>{activePlan.name}</strong>
              <span>{activePlan.product}</span>
            </div>
            <div className="account-meta-list">
              <MetaRow label="Durum" value={planStatus} highlight={subscription?.status === "active"} />
              <MetaRow label="Dönem" value={billingInterval === "yearly" ? "Yıllık" : "Aylık"} />
              <MetaRow label="Bir sonraki ödeme" value={nextPayment} />
              <MetaRow
                label="Tutar"
                value={activePlan.monthly > 0 ? `₺${planPrice} / ay` : "₺0 / ay"}
                highlight={activePlan.monthly > 0}
              />
              <MetaRow label="Kullanım oranı" value={`%${Math.round(expenseRatio)}`} />
            </div>
            <button onClick={onOpenPlans} style={{ ...btnGhost, width: "100%", marginTop: 14 }}>Planı Yönet</button>
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
              <ToggleRow title="E-posta Bildirimleri" text="Haftalık özet ve kritik uyarılar" checked={emailNotif} onChange={setEmailNotif} />
              <ToggleRow title="Push Bildirimleri" text="Anlık işlem uyarıları" checked={pushNotif} onChange={setPushNotif} />
              <ToggleRow title="SMS Uyarıları" text="Güvenlik ve büyük harcamalar" checked={smsNotif} onChange={setSmsNotif} />
            </div>
            {smsNotif && (
              <div style={{ marginTop: 12 }}>
                <FieldLabel>Telefon Numarası (SMS için)</FieldLabel>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+905xxxxxxxxx"
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                />
                <small style={{ color: S.sub, fontSize: 12, marginTop: 4, display: "block" }}>
                  Uluslararası format: +90 ile başlayan Türkiye numaraları
                </small>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              <button
                type="button"
                onClick={() => triggerNotification("alert")}
                disabled={sendingNotif}
                style={{ ...btnPrimary, opacity: sendingNotif ? 0.7 : 1, fontSize: 13, padding: "8px 14px" }}
              >
                {sendingNotif ? "Gönderiliyor…" : "Uyarı Gönder"}
              </button>
              <button
                type="button"
                onClick={() => triggerNotification("weekly")}
                disabled={sendingNotif}
                style={{ ...btnGhost, fontSize: 13, padding: "8px 14px" }}
              >
                Haftalık Özet Gönder
              </button>
              <button
                type="button"
                onClick={fetchLogs}
                style={{ ...btnGhost, fontSize: 13, padding: "8px 14px" }}
              >
                Gönderim Geçmişi
              </button>
            </div>
            {showLogs && notifLogs.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <FieldLabel>Son Gönderimler</FieldLabel>
                <div style={{ display: "grid", gap: 6 }}>
                  {notifLogs.slice(0, 8).map((log) => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: S.surface2 || "#f9f9f9", borderRadius: 8, fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: log.type === "weekly" ? S.cyan : S.amber }}>
                          {log.type === "weekly" ? "Haftalık Özet" : "Uyarı"}
                        </span>
                        <span style={{ color: S.sub, marginLeft: 8 }}>
                          {log.notification_count} bildirim
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {log.email_sent && <span style={{ color: S.green, fontSize: 11 }}>✓ E-posta</span>}
                        {log.sms_sent && <span style={{ color: S.green, fontSize: 11 }}>✓ SMS</span>}
                        {!log.email_sent && !log.sms_sent && <span style={{ color: S.sub, fontSize: 11 }}>Gönderilmedi</span>}
                        <span style={{ color: S.muted, fontSize: 11 }}>
                          {new Date(log.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showLogs && notifLogs.length === 0 && (
              <p style={{ color: S.sub, fontSize: 13, marginTop: 12 }}>Henüz bildirim gönderilmemiş.</p>
            )}
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

function QrCodeBox({ value }) {
  const isImageSource = /^data:image\//.test(value) || /^https?:\/\//.test(value)
  return (
    <div
      style={{
        width: 180,
        height: 180,
        marginTop: 12,
        background: "#fff",
        borderRadius: 10,
        padding: 10,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {isImageSource ? (
        <img
          src={value}
          alt="Authenticator QR kodu"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      ) : (
        <div
          aria-label="Authenticator QR kodu"
          style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  )
}

function sessionDeviceLabel(session) {
  if (!session) return "Aktif oturum bulunamadı"
  return "Mevcut tarayıcı oturumu"
}

function sessionMetaLabel(session, user) {
  if (!session) return "Supabase session bilgisi alınamadı"
  const lastSignIn = user?.last_sign_in_at ? compactDateTime(user.last_sign_in_at) : "Bilinmiyor"
  const expiresAt = session.expires_at ? compactDateTime(session.expires_at * 1000) : "Bilinmiyor"
  return `Son giriş: ${lastSignIn} · Bitiş: ${expiresAt}`
}

function identityProviderLabel(user) {
  const identities = user?.identities || []
  if (identities.length === 0) return user?.app_metadata?.provider || "email"
  return identities.map((identity) => identity.provider).filter(Boolean).join(", ")
}

function MetaRow({ label, value, highlight }) {
  return (
    <div className="account-meta-row">
      <span>{label}</span>
      <strong style={{ color: highlight ? S.green : S.text }}>{value}</strong>
    </div>
  )
}

function statusLabel(status) {
  if (status === "trialing") return "Deneme"
  if (status === "past_due") return "Ödeme bekliyor"
  if (status === "canceled") return "İptal"
  return "Aktif"
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
