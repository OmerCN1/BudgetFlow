import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  loadSystemStats,
  loadTransactionsByMonth,
  loadUserGrowthByMonth,
} from "../../services/adminService"

function StatCard({ label, value, sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card-label">{label}</div>
      <div className="admin-stat-card-value">{value}</div>
      {sub && <div className="admin-stat-card-sub">{sub}</div>}
    </div>
  )
}

const chartTooltipStyle = {
  backgroundColor: "#0e1511",
  border: "1px solid rgba(76,215,246,0.2)",
  borderRadius: 8,
  fontSize: 12,
  color: "#dde4dd",
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [userGrowth, setUserGrowth] = useState([])
  const [txByMonth, setTxByMonth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([loadSystemStats(), loadUserGrowthByMonth(), loadTransactionsByMonth()])
      .then(([s, ug, tx]) => {
        setStats(s)
        setUserGrowth(ug)
        setTxByMonth(tx)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div className="admin-loading">Yükleniyor…</div>
  if (error)
    return <div className="admin-error">Hata: {error}</div>

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-kicker">Genel Bakış</div>
          <div className="admin-section-title">Sistem İstatistikleri</div>
          <div className="admin-section-sub">Tüm kullanıcıların verilerine ait özet</div>
        </div>
      </div>

      <div className="admin-stat-grid" style={{ marginBottom: "2rem" }}>
        <StatCard
          label="Toplam Kullanıcı"
          value={stats.totalUsers.toLocaleString("tr")}
          sub={`+${stats.newUsersLast7Days} son 7 gün`}
        />
        <StatCard
          label="Toplam İşlem"
          value={stats.totalTransactions.toLocaleString("tr")}
        />
        <StatCard
          label="Aktif (30 gün)"
          value={stats.activeUsersLast30Days.toLocaleString("tr")}
          sub="işlem yapan kullanıcı"
        />
        <StatCard
          label="Kategori"
          value={stats.totalCategories.toLocaleString("tr")}
        />
        <StatCard
          label="Hedef"
          value={stats.totalGoals.toLocaleString("tr")}
        />
        <StatCard
          label="Borç"
          value={stats.totalDebts.toLocaleString("tr")}
        />
        <StatCard
          label="Varlık"
          value={stats.totalAssets.toLocaleString("tr")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div className="admin-chart-card">
          <div className="admin-chart-title">Kullanıcı Büyümesi (Son 12 Ay)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowth} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(187,202,191,0.08)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#86948a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#86948a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(76,215,246,0.06)" }} />
              <Bar dataKey="count" fill="#4cd7f6" radius={[4, 4, 0, 0]} name="Yeni Kullanıcı" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-title">İşlem Hacmi (Son 12 Ay)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={txByMonth} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(187,202,191,0.08)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#86948a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#86948a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(76,215,246,0.06)" }} />
              <Bar dataKey="count" fill="#4edea3" radius={[4, 4, 0, 0]} name="İşlem" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
