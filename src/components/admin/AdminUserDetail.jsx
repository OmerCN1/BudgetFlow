import { useState } from "react"
import { banUser, unbanUser, updateUserRole } from "../../services/adminService"

function maskEmail(email) {
  if (!email) return "—"
  const [local, domain] = email.split("@")
  if (!domain) return email
  const masked = local.length <= 2 ? local[0] + "*" : local[0] + "***" + local.slice(-1)
  return `${masked}@${domain}`
}

export default function AdminUserDetail({ user, adminId, onClose, onRoleChange, onBanChange }) {
  const [newRole, setNewRole] = useState(user.role)
  const [saving, setSaving] = useState(false)
  const [banning, setBanning] = useState(false)
  const [error, setError] = useState(null)

  async function handleRoleChange() {
    if (newRole === user.role) return
    setSaving(true)
    setError(null)
    try {
      await updateUserRole(adminId, user.user_id, newRole)
      onRoleChange(user.user_id, newRole)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleBanToggle() {
    setBanning(true)
    setError(null)
    try {
      if (user.is_banned) {
        await unbanUser(adminId, user.user_id)
        onBanChange(user.user_id, false)
      } else {
        await banUser(adminId, user.user_id)
        onBanChange(user.user_id, true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBanning(false)
    }
  }

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <div className="admin-kicker">Kullanıcı Detayı</div>
            <div className="admin-section-title" style={{ fontSize: "1.1rem" }}>
              {user.display_name || "İsimsiz"}
            </div>
          </div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-detail-grid">
            <div className="admin-detail-row">
              <span className="admin-detail-label">Email</span>
              <span className="admin-detail-value">{maskEmail(user.email)}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Kullanıcı ID</span>
              <span className="admin-detail-value" style={{ fontSize: "0.7rem" }}>{user.user_id}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Katılım</span>
              <span className="admin-detail-value">{joinDate}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">İşlem Sayısı</span>
              <span className="admin-detail-value">{user.transactionCount || 0}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Mevcut Rol</span>
              <span className={`admin-badge-${user.role}`}>{user.role}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Hesap Durumu</span>
              <span className={user.is_banned ? "admin-badge-banned" : "admin-badge-active"}>
                {user.is_banned ? "Askıda" : "Aktif"}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div className="admin-detail-label" style={{ marginBottom: "0.5rem" }}>Hesap Yönetimi</div>
            <button
              className={user.is_banned ? "admin-action-btn" : "admin-ban-btn"}
              onClick={handleBanToggle}
              disabled={banning || user.role === "admin"}
            >
              {banning ? "İşleniyor…" : user.is_banned ? "Askıyı Kaldır" : "Hesabı Askıya Al"}
            </button>
            {user.role === "admin" && (
              <div className="admin-warn-note" style={{ marginTop: "0.4rem" }}>
                Admin hesapları askıya alınamaz.
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div className="admin-detail-label" style={{ marginBottom: "0.5rem" }}>Rol Değiştir</div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <select
                className="admin-search-input"
                style={{ width: "auto" }}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={saving}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button
                className="admin-action-btn"
                onClick={handleRoleChange}
                disabled={saving || newRole === user.role}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
            {error && <div className="admin-error" style={{ marginTop: "0.5rem" }}>{error}</div>}
            {newRole === "admin" && user.role !== "admin" && (
              <div className="admin-warn-note">
                Bu kullanıcı admin paneline tam erişim kazanacak.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
