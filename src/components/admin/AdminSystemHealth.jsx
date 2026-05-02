import { useEffect, useState } from "react"
import { loadAllNotificationLogs } from "../../services/adminService"

function HealthCard({ label, status, detail }) {
  const dotClass = status === "ok" ? "ok" : status === "warn" ? "warn" : "error"
  const statusText = status === "ok" ? "Aktif" : status === "warn" ? "Uyarı" : "Hata"
  return (
    <div className="admin-health-card">
      <div className={`admin-health-dot ${dotClass}`} />
      <div style={{ flex: 1 }}>
        <div style={{ color: "#dde4dd", fontWeight: 700, fontSize: "0.875rem" }}>{label}</div>
        {detail && <div style={{ color: "#86948a", fontSize: "0.75rem", marginTop: "0.2rem" }}>{detail}</div>}
      </div>
      <span style={{
        fontSize: "0.65rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: dotClass === "ok" ? "#4edea3" : dotClass === "warn" ? "#f59e0b" : "#f43f5e",
      }}>
        {statusText}
      </span>
    </div>
  )
}

export default function AdminSystemHealth() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllNotificationLogs(50)
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const emailErrors = logs.filter((l) => l.email_error).length
  const smsErrors = logs.filter((l) => l.sms_error).length
  const emailOk = logs.filter((l) => l.email_sent).length
  const smsOk = logs.filter((l) => l.sms_sent).length

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-kicker">Sistem Sağlığı</div>
          <div className="admin-section-title">Edge Functions & Bildirimler</div>
          <div className="admin-section-sub">Son 50 bildirim logu</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        <HealthCard
          label="AI Coach"
          status="ok"
          detail="supabase/functions/ai-coach"
        />
        <HealthCard
          label="Receipt Scanner"
          status="ok"
          detail="supabase/functions/receipt-scanner"
        />
        <HealthCard
          label="Bildirim Servisi"
          status={emailErrors > 0 || smsErrors > 0 ? "warn" : "ok"}
          detail={`${emailOk} email, ${smsOk} SMS başarılı`}
        />
        <HealthCard
          label="Email Hataları"
          status={emailErrors > 0 ? "error" : "ok"}
          detail={`${emailErrors} başarısız gönderim`}
        />
        <HealthCard
          label="SMS Hataları"
          status={smsErrors > 0 ? "error" : "ok"}
          detail={`${smsErrors} başarısız gönderim`}
        />
      </div>

      <div className="admin-kicker" style={{ marginBottom: "0.75rem" }}>Son Bildirim Logları</div>

      {loading && <div className="admin-loading">Yükleniyor…</div>}
      {error && <div className="admin-error">Hata: {error}</div>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Kullanıcı ID</th>
                <th>Tür</th>
                <th>Email</th>
                <th>SMS</th>
                <th>Hata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleDateString("tr-TR")}</td>
                  <td style={{ fontSize: "0.68rem" }}>{log.user_id?.slice(0, 8)}…</td>
                  <td>{log.type}</td>
                  <td>
                    <span style={{ color: log.email_sent ? "#4edea3" : "#86948a" }}>
                      {log.email_sent ? "✓" : "—"}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: log.sms_sent ? "#4edea3" : "#86948a" }}>
                      {log.sms_sent ? "✓" : "—"}
                    </span>
                  </td>
                  <td style={{ color: "#f43f5e", fontSize: "0.7rem" }}>
                    {log.email_error || log.sms_error || "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#86948a", padding: "2rem" }}>
                    Henüz bildirim logu yok
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
