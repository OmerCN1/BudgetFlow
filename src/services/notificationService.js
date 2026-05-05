import { supabase } from "../lib/supabase"

const isSchemaMissing = (error) => {
  const message = error?.message || ""
  return (
    message.includes("schema cache") ||
    message.includes("relation") ||
    message.includes("column") ||
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    error?.code === "PGRST202"
  )
}

const toStoredNotification = (row) => ({
  id: row.id,
  type: row.type || "broadcast",
  title: row.title,
  message: row.message,
  isRead: Boolean(row.is_read),
  readAt: row.read_at || null,
  createdAt: row.created_at,
})

export async function loadStoredNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    if (isSchemaMissing(error)) return []
    throw error
  }

  return (data || []).map(toStoredNotification)
}

export async function markStoredNotificationRead(userId, id) {
  let { data, error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: id,
  })

  if (!error) return toStoredNotification(data)
  if (!isSchemaMissing(error)) throw error

  const fallback = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  data = fallback.data
  error = fallback.error
  if (error) throw error
  return toStoredNotification(data)
}

export async function sendNotification(userId, type = "alert") {
  const { data, error } = await supabase.functions.invoke("send-notifications", {
    body: { user_id: userId, type },
  })
  if (error) throw error
  return data
}

export async function loadNotificationLogs(userId) {
  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) throw error
  return data || []
}
