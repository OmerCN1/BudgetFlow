import { supabase } from "../lib/supabase"

export async function loadAllUsers() {
  const { data: profiles, error } = await supabase.rpc("get_all_user_profiles")
  if (error) throw error

  // Her kullanıcının transaction sayısını al
  const { data: txCounts, error: txErr } = await supabase
    .from("transactions")
    .select("user_id")
  if (txErr) throw txErr

  const countMap = {}
  for (const row of txCounts || []) {
    countMap[row.user_id] = (countMap[row.user_id] || 0) + 1
  }

  return (profiles || []).map((p) => ({
    ...p,
    role: p.user_role,
    transactionCount: countMap[p.user_id] || 0,
  }))
}

export async function loadSystemStats() {
  const [
    { count: totalUsers },
    { count: totalTransactions },
    { count: totalCategories },
    { count: totalGoals },
    { count: totalDebts },
    { count: totalAssets },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("goals").select("*", { count: "exact", head: true }),
    supabase.from("debts").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
  ])

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: newUsersLast7Days } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString())

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: activeTx } = await supabase
    .from("transactions")
    .select("user_id")
    .gte("created_at", thirtyDaysAgo.toISOString())

  const activeUserIds = new Set((activeTx || []).map((t) => t.user_id))

  return {
    totalUsers: totalUsers || 0,
    totalTransactions: totalTransactions || 0,
    totalCategories: totalCategories || 0,
    totalGoals: totalGoals || 0,
    totalDebts: totalDebts || 0,
    totalAssets: totalAssets || 0,
    newUsersLast7Days: newUsersLast7Days || 0,
    activeUsersLast30Days: activeUserIds.size,
  }
}

export async function loadUserGrowthByMonth() {
  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .order("created_at", { ascending: true })
  if (error) throw error

  const monthMap = {}
  for (const row of data || []) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthMap[key] = (monthMap[key] || 0) + 1
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }))
}

export async function loadTransactionsByMonth() {
  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_date")
    .order("transaction_date", { ascending: true })
  if (error) throw error

  const monthMap = {}
  for (const row of data || []) {
    const d = new Date(row.transaction_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthMap[key] = (monthMap[key] || 0) + 1
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }))
}

export async function loadAllNotificationLogs(limit = 100) {
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function loadAuditLogs(limit = 200) {
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function writeAuditLog(adminId, action, targetUserId = null, details = null) {
  const { error } = await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId,
    details,
  })
  if (error) console.error("Audit log write failed:", error)
}

export async function updateUserRole(adminId, targetUserId, newRole) {
  await writeAuditLog(adminId, "change_role", targetUserId, { new_role: newRole })
  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: targetUserId,
    new_role: newRole,
  })
  if (error) throw error
}

export async function banUser(adminId, targetUserId) {
  await writeAuditLog(adminId, "ban_user", targetUserId, null)
  const { error } = await supabase.rpc("set_user_banned", {
    target_user_id: targetUserId,
    next_is_banned: true,
  })
  if (error) throw error
}

export async function unbanUser(adminId, targetUserId) {
  await writeAuditLog(adminId, "unban_user", targetUserId, null)
  const { error } = await supabase.rpc("set_user_banned", {
    target_user_id: targetUserId,
    next_is_banned: false,
  })
  if (error) throw error
}

export async function sendBroadcastNotification(adminId, { title, message, type = "broadcast" }) {
  const { data: users, error: usersErr } = await supabase.rpc("get_all_user_profiles")
  if (usersErr) throw usersErr

  const rows = (users || [])
    .filter((u) => !u.is_banned)
    .map((u) => ({
      user_id: u.user_id,
      type,
      title,
      message,
      is_read: false,
    }))

  if (rows.length === 0) return 0

  const { error } = await supabase.from("notifications").insert(rows)
  if (error) throw error

  await writeAuditLog(adminId, "broadcast_notification", null, { title, message, recipient_count: rows.length })
  return rows.length
}
