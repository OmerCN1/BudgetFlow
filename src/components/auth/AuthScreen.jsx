import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase"
import { FONT_BODY } from "../../constants/theme"

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
  </svg>
)

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const IconApple = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.53 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
)

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const FEATURES = [
  { icon: "📊", text: "Tüm varlıklarınızı tek panelden yönetin" },
  { icon: "🤖", text: "Yapay zeka destekli finansal koçluk" },
  { icon: "📄", text: "Fiş ve fatura tarama & kategorizasyon" },
  { icon: "📈", text: "Gerçek zamanlı portföy analizi" },
]

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", Icon: IconGoogle },
  { id: "apple",  label: "Apple",  Icon: IconApple },
]

function getAuthErrorMessage(authError) {
  const msg = authError.message.toLowerCase()
  if (msg.includes("rate limit"))
    return "Supabase e-posta gönderim limiti doldu. Biraz bekleyip tekrar deneyin."
  if (msg.includes("email address") && msg.includes("is invalid"))
    return "E-posta adresi geçersiz görünüyor. Boşluk olmadığından emin olun."
  return authError.message
}

export default function AuthScreen({ isConfigured, initialMode = "login", onBackLanding, onOpenPage }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [animating, setAnimating] = useState(false)
  const switchTimerRef = useRef(null)

  const isSignup = mode === "signup"

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => () => clearTimeout(switchTimerRef.current), [])

  const switchMode = (newMode) => {
    if (animating) return
    setAnimating(true)
    setError("")
    setMessage("")
    switchTimerRef.current = setTimeout(() => {
      setMode(newMode)
      setAnimating(false)
    }, 220)
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanDisplayName = displayName.trim()

    const authCall = isSignup
      ? supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: cleanDisplayName } },
        })
      : supabase.auth.signInWithPassword({ email: cleanEmail, password })

    const { data, error: authError } = await authCall

    setLoading(false)

    if (authError) {
      setError(getAuthErrorMessage(authError))
      return
    }

    if (isSignup && !data.session) {
      setMessage("Kayıt alındı. E-posta onayı açıksa gelen kutunuzu kontrol edin.")
      return
    }

    setMessage(isSignup ? "Hesabınız oluşturuldu." : "Giriş başarılı.")
  }

  return (
    <div className="auth2-root" style={{ fontFamily: FONT_BODY }}>
      {/* Left decorative panel */}
      <div className="auth2-panel">
        <button className="auth2-back-btn" onClick={onBackLanding} type="button">
          <IconArrowLeft />
          <span>Ana Sayfa</span>
        </button>

        <div className="auth2-panel-content">
          <div className="auth2-brand">
            <div className="auth2-brand-mark">BF</div>
            <span className="auth2-brand-name">BudgetFlow</span>
          </div>

          <div className="auth2-panel-hero">
            <h2 className="auth2-panel-title">
              Finansal özgürlüğünüzü<br />
              <span>keşfedin.</span>
            </h2>
            <p className="auth2-panel-sub">
              Varlıklarınızı takip edin, harcamalarınızı analiz edin ve yapay zeka destekli önerilerle daha iyi finansal kararlar verin.
            </p>
          </div>

          <ul className="auth2-features">
            {FEATURES.map((f, i) => (
              <li key={i} className="auth2-feature-item" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <span className="auth2-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="auth2-panel-badge">
            <IconShield />
            <span>256-bit şifreli · GDPR uyumlu · Ücretsiz başlayın</span>
          </div>
        </div>

        {/* Background orbs */}
        <div className="auth2-orb auth2-orb-1" />
        <div className="auth2-orb auth2-orb-2" />
        <div className="auth2-orb auth2-orb-3" />
      </div>

      {/* Right form panel */}
      <div className="auth2-form-side">
        <div className="auth2-form-container">
          {/* Mobile brand */}
          <div className="auth2-mobile-brand">
            <button className="auth2-back-btn-mobile" onClick={onBackLanding} type="button">
              <IconArrowLeft />
            </button>
            <div className="auth2-brand">
              <div className="auth2-brand-mark">BF</div>
              <span className="auth2-brand-name">BudgetFlow</span>
            </div>
          </div>

          <div className={`auth2-form-wrap ${animating ? "auth2-fade-out" : "auth2-fade-in"}`}>
            {/* Header */}
            <div className="auth2-form-header">
              <h1 className="auth2-form-title">
                {isSignup ? "Hesap oluşturun" : "Tekrar hoş geldiniz"}
              </h1>
              <p className="auth2-form-sub">
                {isSignup
                  ? "Dakikalar içinde ücretsiz hesabınızı açın."
                  : "Hesabınıza giriş yaparak devam edin."}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="auth2-tabs">
              <button
                type="button"
                className={`auth2-tab ${!isSignup ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                className={`auth2-tab ${isSignup ? "active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Kayıt Ol
              </button>
            </div>

            {!isConfigured ? (
              <div className="auth2-warning">
                Supabase bağlantısı eksik. <code>.env.local</code> dosyasına{" "}
                <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>{" "}
                değerlerini ekleyin.
              </div>
            ) : (
              <form onSubmit={submit} className="auth2-form" noValidate>
                {/* Display name — signup only */}
                {isSignup && (
                  <div className="auth2-field">
                    <div className="auth2-input-group">
                      <span className="auth2-input-icon">
                        <IconUser />
                      </span>
                      <input
                        className="auth2-input"
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder=" "
                        autoComplete="name"
                      />
                      <label className="auth2-float-label" htmlFor="displayName">
                        Ad Soyad
                      </label>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="auth2-field">
                  <div className="auth2-input-group">
                    <span className="auth2-input-icon">
                      <IconMail />
                    </span>
                    <input
                      className="auth2-input"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      required
                      autoComplete="email"
                    />
                    <label className="auth2-float-label" htmlFor="email">
                      E-posta Adresi
                    </label>
                  </div>
                </div>

                {/* Password */}
                <div className="auth2-field">
                  <div className="auth2-input-group">
                    <span className="auth2-input-icon">
                      <IconLock />
                    </span>
                    <input
                      className="auth2-input"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      minLength={6}
                      required
                      autoComplete={isSignup ? "new-password" : "current-password"}
                    />
                    <label className="auth2-float-label" htmlFor="password">
                      Şifre
                    </label>
                    <button
                      type="button"
                      className="auth2-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {!isSignup && (
                    <div className="auth2-forgot-row">
                      <button
                        type="button"
                        className="auth2-forgot-btn"
                        onClick={() => setMessage("Şifre sıfırlama için Supabase e-posta ayarlarını etkinleştirin.")}
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  )}
                  {isSignup && password.length > 0 && (
                    <PasswordStrength password={password} />
                  )}
                </div>

                {/* Feedback */}
                {error && (
                  <div className="auth2-alert auth2-alert-error">
                    <span className="auth2-alert-dot" />
                    {error}
                  </div>
                )}
                {message && (
                  <div className="auth2-alert auth2-alert-success">
                    <span className="auth2-alert-dot" />
                    {message}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`auth2-submit-btn ${loading ? "loading" : ""}`}
                >
                  {loading ? (
                    <span className="auth2-spinner" />
                  ) : isSignup ? (
                    "Ücretsiz Kayıt Ol"
                  ) : (
                    "Giriş Yap"
                  )}
                </button>

                {/* Divider */}
                <div className="auth2-divider">
                  <span>veya şununla devam et</span>
                </div>

                {/* Social */}
                <div className="auth2-social-row">
                  {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className="auth2-social-btn"
                      onClick={() => setError(`${label} girişi bu kurulumda etkin değil.`)}
                    >
                      <Icon />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Switch mode */}
                <p className="auth2-switch">
                  {isSignup ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}
                  {" "}
                  <button
                    type="button"
                    className="auth2-switch-btn"
                    onClick={() => switchMode(isSignup ? "login" : "signup")}
                  >
                    {isSignup ? "Giriş Yap" : "Ücretsiz Kayıt Ol"}
                  </button>
                </p>
              </form>
            )}
          </div>

          <footer className="auth2-footer">
            <a href="#privacy" onClick={(event) => { event.preventDefault(); onOpenPage("privacy") }}>Gizlilik</a>
            <a href="#terms" onClick={(event) => { event.preventDefault(); onOpenPage("terms") }}>Kullanım Koşulları</a>
            <a href="#security" onClick={(event) => { event.preventDefault(); onOpenPage("security") }}>Güvenlik</a>
            <span>© 2026 BudgetFlow</span>
          </footer>
        </div>
      </div>
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ["Çok zayıf", "Zayıf", "Orta", "Güçlü", "Çok güçlü"]
  const colors = ["#f43f5e", "#f59e0b", "#f59e0b", "#4edea3", "#4edea3"]

  return (
    <div className="auth2-pw-strength">
      <div className="auth2-pw-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="auth2-pw-bar"
            style={{
              background: i < score ? colors[score] : "rgba(187,202,191,0.15)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <span className="auth2-pw-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  )
}
