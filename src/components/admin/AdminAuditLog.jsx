import { useEffect, useState } from "react"
import { loadAuditLogs } from "../../services/adminService"

const ACTION_LABELS = {
  view_user: "Kullanıcı Görüntülendi",
  change_role: "Rol Değiştirildi",
  ban_user: "Hesap Askıya Alındı",
  unban_user: "Askı Kaldırıldı",
  broadcast_notification: "Toplu Bildirim",
  view_data: "Veri Görüntülendi",
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    loadAuditLogs(200)
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.action === filter)

  const actions = [...new Set(logs.map((l) => l.action))]

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-kicker">Audit Log</div>
          <div className="admin-section-title">Admin İşlem Kayıtları</div>
          <div className="admin-section-sub">Son 200 admin aksiyonu</div>
        </div>
      </div>

      <div className="admin-search-bar">
        <select
          className="admin-search-input"
          style={{ width: "auto" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tüm aksiyonlar</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] || a}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#86948a" }}>
          {filtered.length} kayıt
        </span>
      </div>

      {loading && <div className="admin-loading">Yükleniyor…</div>}
      {error && <div className="admin-error">Hata: {error}</div>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih / Saat</th>
                <th>Admin ID</th>
                <th>Aksiyon</th>
                <th>Hedef Kullanıcı</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.created_at).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ fontSize: "0.68rem" }}>{log.admin_id?.slice(0, 8)}…</td>
                  <td>
                    <span className="admin-badge-admin" style={{ fontSize: "0.6rem" }}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.68rem" }}>
                    {log.target_user_id ? `${log.target_user_id.slice(0, 8)}…` : "—"}
                  </td>
                  <td style={{ fontSize: "0.7rem", color: "#86948a" }}>
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#86948a", padding: "2rem" }}>
                    Henüz audit logu yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
