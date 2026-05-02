import { useEffect, useState } from "react"
import { loadAllUsers, writeAuditLog } from "../../services/adminService"
import AdminUserDetail from "./AdminUserDetail"

function maskEmail(email) {
  if (!email) return "—"
  const [local, domain] = email.split("@")
  if (!domain) return email
  const masked = local.length <= 2 ? local[0] + "*" : local[0] + "***" + local.slice(-1)
  return `${masked}@${domain}`
}

export default function AdminUsers({ adminId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("created_at")
  const [sortDir, setSortDir] = useState("desc")
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return " ↕"
    return sortDir === "asc" ? " ↑" : " ↓"
  }

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase()
      return (
        !q ||
        (u.display_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (sortKey === "transactionCount") {
        av = Number(av) || 0
        bv = Number(bv) || 0
        return sortDir === "asc" ? av - bv : bv - av
      }
      av = av || ""
      bv = bv || ""
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  async function handleRowClick(user) {
    await writeAuditLog(adminId, "view_user", user.user_id, { email_domain: user.email?.split("@")[1] })
    setSelectedUser(user)
  }

  function handleRoleChange(userId, newRole) {
    setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)))
    setSelectedUser((prev) => (prev?.user_id === userId ? { ...prev, role: newRole } : prev))
  }

  function handleBanChange(userId, isBanned) {
    setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, is_banned: isBanned } : u)))
    setSelectedUser((prev) => (prev?.user_id === userId ? { ...prev, is_banned: isBanned } : prev))
  }

  if (loading) return <div className="admin-loading">Kullanıcılar yükleniyor…</div>
  if (error) return <div className="admin-error">Hata: {error}</div>

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-kicker">Kullanıcı Yönetimi</div>
          <div className="admin-section-title">Tüm Kullanıcılar</div>
          <div className="admin-section-sub">{users.length} kayıt</div>
        </div>
      </div>

      <div className="admin-search-bar">
        <input
          className="admin-search-input"
          placeholder="İsim veya email ile ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="admin-action-btn" onClick={() => setSearch("")}>
            Temizle
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#86948a" }}>
          {filtered.length} sonuç
        </span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("display_name")}>İsim{sortIndicator("display_name")}</th>
              <th>Email</th>
              <th onClick={() => toggleSort("role")}>Rol{sortIndicator("role")}</th>
              <th onClick={() => toggleSort("transactionCount")}>İşlem{sortIndicator("transactionCount")}</th>
              <th onClick={() => toggleSort("created_at")}>Katılım{sortIndicator("created_at")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.user_id} onClick={() => handleRowClick(u)}>
                <td style={{ color: "#dde4dd", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {u.display_name || <span style={{ color: "#86948a" }}>—</span>}
                </td>
                <td>{maskEmail(u.email)}</td>
                <td>
                  <span className={`admin-badge-${u.role}`}>{u.role}</span>
                  {u.is_banned && <span className="admin-badge-banned" style={{ marginLeft: "0.4rem" }}>Askıda</span>}
                </td>
                <td>{u.transactionCount}</td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("tr-TR")
                    : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#86948a", padding: "2rem" }}>
                  Sonuç bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <AdminUserDetail
          user={selectedUser}
          adminId={adminId}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleRoleChange}
          onBanChange={handleBanChange}
        />
      )}
    </div>
  )
}
