import { useState } from "react"
import { sendBroadcastNotification } from "../../services/adminService"

const TYPES = [
  { value: "broadcast", label: "Genel Duyuru" },
  { value: "alert", label: "Uyarı" },
  { value: "info", label: "Bilgi" },
]

export default function AdminBroadcast({ adminId }) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("broadcast")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSend() {
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setResult(null)
    setError(null)
    try {
      const count = await sendBroadcastNotification(adminId, { title: title.trim(), message: message.trim(), type })
      setResult(count)
      setTitle("")
      setMessage("")
      setType("broadcast")
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-kicker">Bildirim Merkezi</div>
          <div className="admin-section-title">Toplu Bildirim Gönder</div>
          <div className="admin-section-sub">Tüm kullanıcılara aynı anda bildirim gönderir</div>
        </div>
      </div>

      <div className="admin-broadcast-card">
        <div className="admin-broadcast-field">
          <label className="admin-detail-label">Bildirim Türü</label>
          <div className="admin-broadcast-type-row">
            {TYPES.map((t) => (
              <button
                key={t.value}
                className={`admin-type-btn${type === t.value ? " is-active" : ""}`}
                onClick={() => setType(t.value)}
                disabled={sending}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-broadcast-field">
          <label className="admin-detail-label">Başlık</label>
          <input
            className="admin-search-input"
            style={{ width: "100%" }}
            placeholder="Bildirim başlığı…"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            disabled={sending}
          />
          <span className="admin-char-count">{title.length}/100</span>
        </div>

        <div className="admin-broadcast-field">
          <label className="admin-detail-label">Mesaj</label>
          <textarea
            className="admin-broadcast-textarea"
            placeholder="Kullanıcılara gönderilecek mesaj…"
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            rows={4}
          />
          <span className="admin-char-count">{message.length}/500</span>
        </div>

        <div className="admin-broadcast-preview">
          <div className="admin-detail-label" style={{ marginBottom: "0.5rem" }}>Önizleme</div>
          <div className="admin-broadcast-preview-box">
            <div className="admin-broadcast-preview-title">{title || "Başlık…"}</div>
            <div className="admin-broadcast-preview-msg">{message || "Mesaj içeriği…"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <button
            className="admin-action-btn admin-send-btn"
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
          >
            {sending ? "Gönderiliyor…" : "Tüm Kullanıcılara Gönder"}
          </button>
          {result !== null && (
            <span className="admin-broadcast-success">
              ✓ {result} kullanıcıya gönderildi
            </span>
          )}
        </div>

        {error && <div className="admin-error" style={{ marginTop: "0.75rem" }}>Hata: {error}</div>}

        <div className="admin-warn-note" style={{ marginTop: "1rem" }}>
          Bu işlem geri alınamaz. Mesaj tüm aktif kullanıcıların bildirim kutusuna düşer.
        </div>
      </div>
    </div>
  )
}
