import { useEffect, useState } from "react"

import FieldLabel from "../ui/FieldLabel"
import { supabase } from "../../lib/supabase"
import { S, FONT_BODY, inputStyle, btnGhost, btnPrimary } from "../../constants/theme"

export default function AuthScreen({ isConfigured, initialMode = "login", onBackLanding }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const isSignup = mode === "signup"

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

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
      const message = authError.message.toLowerCase()
      setError(
        message.includes("rate limit")
          ? "Supabase e-posta gönderim limiti doldu. Biraz bekleyip tekrar deneyin veya geliştirme için e-posta onayını kapatın."
          : authError.message.includes("Email address") && authError.message.includes("is invalid")
          ? "E-posta adresi geçersiz görünüyor. Boşluk olmadığından ve gerçek bir adres kullandığınızdan emin olun."
          : authError.message
      )
      return
    }

    if (isSignup && !data.session) {
      setMessage("Kayıt alındı. Supabase e-posta onayı açıksa gelen kutunuzu kontrol edin.")
      return
    }

    setMessage(isSignup ? "Hesabınız oluşturuldu." : "Giriş başarılı.")
  }

  return (
    <div className="auth-page" style={{ fontFamily: FONT_BODY }}>
      <header className="auth-topbar">
        <button className="public-brand" onClick={onBackLanding} type="button" aria-label="BudgetFlow ana sayfa">
          <span className="public-brand-mark">BF</span>
          <span>BudgetFlow</span>
        </button>
        <nav>
          <button type="button">Yardım</button>
          <button type="button">Güvenlik</button>
        </nav>
      </header>

      <main className="auth-center">
        <section className="glass-card auth-card">
          <div className="auth-copy">
            <h1>{isSignup ? "Ücretsiz hesabınızı oluşturun" : "Tekrar hoş geldiniz"}</h1>
            <p>{isSignup ? "Varlıklarınızı yönetmeye başlamak için hesabınızı hazırlayın." : "Varlıklarınızı yönetmek için hesabınıza erişin."}</p>
          </div>

          {!isConfigured ? (
            <div
              style={{
                border: `1px solid ${S.amber}`,
                background: `${S.amber}14`,
                color: S.text,
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              Supabase bağlantısı eksik. `.env.local` içine `VITE_SUPABASE_URL` ve
              `VITE_SUPABASE_PUBLISHABLE_KEY` değerlerini ekleyin.
            </div>
          ) : (
            <form onSubmit={submit} className="auth-form">
              {isSignup && (
                <div>
                  <FieldLabel>Ad Soyad</FieldLabel>
                  <div className="auth-input-wrap">
                    <span>◉</span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Örn. Omer Yilmaz"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}
              <div>
                <FieldLabel>E-posta Adresi</FieldLabel>
                <div className="auth-input-wrap">
                  <span>✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="isim@sirket.com"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <div className="auth-label-row">
                  <FieldLabel>Şifre</FieldLabel>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() => setMessage("Şifre sıfırlama için Supabase e-posta ayarlarını etkinleştirin.")}
                    >
                      Şifremi Unuttum
                    </button>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <span>▣</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-message">{message}</div>}

              <button type="submit" disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "16px 20px", fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? "İşleniyor..." : isSignup ? "Ücretsiz Kayıt Ol" : "Giriş Yap"}
              </button>

              <div className="auth-divider"><span>Veya şununla devam et</span></div>

              <div className="auth-social-grid">
                <button type="button" style={btnGhost} onClick={() => setError("Google girişi bu kurulumda etkin değil.")}>
                  <b>G</b> Google
                </button>
                <button type="button" style={btnGhost} onClick={() => setError("Apple girişi bu kurulumda etkin değil.")}>
                  <b></b> Apple
                </button>
              </div>

              <div className="auth-switch">
                {isSignup ? "Zaten hesabınız var mı?" : "Henüz hesabınız yok mu?"}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignup ? "login" : "signup")
                    setError("")
                    setMessage("")
                  }}
                >
                  {isSignup ? "Giriş Yap" : "Ücretsiz Kayıt Ol"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="auth-footer">
        <nav>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
        </nav>
        <span>© 2026 BUDGETFLOW. LUMINOUS WEALTH MANAGEMENT.</span>
      </footer>
    </div>
  )
}
