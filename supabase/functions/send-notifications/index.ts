import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string
  severity: "danger" | "warning" | "success" | "info"
  title: string
  body: string
  value?: string
}

interface Profile {
  user_id: string
  display_name: string | null
  notification_email: boolean
  notification_sms: boolean
  phone_number: string | null
  timezone: string
  currency: string
}

interface SendResult {
  email?: { sent: boolean; error?: string }
  sms?: { sent: boolean; error?: string }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function severityEmoji(severity: string) {
  if (severity === "danger") return "🔴"
  if (severity === "warning") return "🟡"
  if (severity === "success") return "🟢"
  return "🔵"
}

function buildNotificationsFromData(data: {
  transactions: Array<{ type: string; amount: number; category_id: string; transaction_date: string }>
  categories: Array<{ id: string; name: string; is_income: boolean; monthly_budget: number; is_archived: boolean }>
  goals: Array<{ id: string; name: string; target_amount: number; current_amount: number; is_archived: boolean }>
  recurringRules: Array<{ id: string; name: string; type: string; amount: number; next_date: string; is_active: boolean }>
  debts: Array<{ id: string; person_name: string; amount: number; direction: string; due_date: string | null; is_settled: boolean }>
}): NotificationItem[] {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const items: NotificationItem[] = []

  const monthTxs = data.transactions.filter((tx) => tx.transaction_date.startsWith(monthKey))
  const totalIncome = monthTxs.filter((tx) => tx.type === "income").reduce((s, tx) => s + Number(tx.amount), 0)
  const totalExpense = monthTxs.filter((tx) => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount), 0)
  const net = totalIncome - totalExpense

  if (net < 0) {
    items.push({
      id: "negative-net",
      severity: "danger",
      title: "Nakit akışı negatif",
      body: `Bu ay giderler gelirleri aşıyor. Net: ${net.toFixed(2)} TL`,
      value: `${net.toFixed(2)} TL`,
    })
  }

  data.categories
    .filter((cat) => !cat.is_income && !cat.is_archived && cat.monthly_budget > 0)
    .forEach((cat) => {
      const spent = monthTxs
        .filter((tx) => tx.type === "expense" && tx.category_id === cat.id)
        .reduce((s, tx) => s + Number(tx.amount), 0)
      const pct = (spent / cat.monthly_budget) * 100
      if (pct >= 80) {
        items.push({
          id: `budget-${cat.id}`,
          severity: pct >= 100 ? "danger" : "warning",
          title: `${cat.name} bütçesi ${pct >= 100 ? "aşıldı" : "yaklaştı"}`,
          body: `${spent.toFixed(2)} / ${cat.monthly_budget.toFixed(2)} TL kullanıldı (%${Math.round(pct)})`,
          value: `%${Math.round(pct)}`,
        })
      }
    })

  data.recurringRules
    .filter((rule) => rule.is_active)
    .forEach((rule) => {
      const target = new Date(`${rule.next_date}T12:00:00`)
      const days = Math.ceil((target.getTime() - now.getTime()) / 86400000)
      if (days >= 0 && days <= 7) {
        items.push({
          id: `recurring-${rule.id}`,
          severity: days <= 2 ? "warning" : "info",
          title: `${rule.name} yaklaşıyor`,
          body: days === 0 ? "Bugün planlandı." : `${days} gün sonra: ${Number(rule.amount).toFixed(2)} TL`,
          value: `${rule.type === "income" ? "+" : "-"}${Number(rule.amount).toFixed(2)} TL`,
        })
      }
    })

  data.goals
    .filter((goal) => !goal.is_archived && goal.target_amount > 0)
    .forEach((goal) => {
      const pct = (goal.current_amount / goal.target_amount) * 100
      if (pct >= 90 && pct < 100) {
        items.push({
          id: `goal-${goal.id}`,
          severity: "success",
          title: `${goal.name} hedefi bitişe yakın`,
          body: `${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)} TL (%${Math.round(pct)})`,
          value: `%${Math.round(pct)}`,
        })
      }
    })

  data.debts
    .filter((debt) => !debt.is_settled && debt.due_date)
    .forEach((debt) => {
      const dueDate = new Date(`${debt.due_date}T12:00:00`)
      const days = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000)
      if (days >= 0 && days <= 7) {
        const direction = debt.direction === "i_owe" ? "ödemeniz gereken" : "alacaklı olduğunuz"
        items.push({
          id: `debt-${debt.id}`,
          severity: days <= 2 ? "danger" : "warning",
          title: `Borç vadesi yaklaşıyor: ${debt.person_name}`,
          body: `${debt.person_name} ile ${direction} ${Number(debt.amount).toFixed(2)} TL — ${days} gün kaldı`,
          value: `${Number(debt.amount).toFixed(2)} TL`,
        })
      }
    })

  return items.sort((a, b) => {
    const rank: Record<string, number> = { danger: 3, warning: 2, success: 1, info: 0 }
    return (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0)
  })
}

function buildWeeklySummary(data: {
  transactions: Array<{ type: string; amount: number; transaction_date: string }>
}): { income: number; expense: number; net: number; txCount: number } {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekTxs = data.transactions.filter((tx) => {
    const d = new Date(tx.transaction_date)
    return d >= weekAgo && d <= now
  })

  const income = weekTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  const expense = weekTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
  return { income, expense, net: income - expense, txCount: weekTxs.length }
}

// ── Email via Gmail SMTP ───────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  gmailUser: string
  gmailAppPassword: string
}): Promise<{ sent: boolean; error?: string }> {
  try {
    // Gmail SMTP via smtp2go-style relay — use smtp.gmail.com through fetch-based SMTP
    // Deno doesn't have native SMTP, so we use an SMTP-over-HTTP relay (smtp2go free tier)
    // OR encode as a raw SMTP request using Deno's TCP — simplest is to use a free relay API

    // We'll use Gmail's API via OAuth2... but simplest for Deno is smtp library
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts")

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: opts.gmailUser,
          password: opts.gmailAppPassword,
        },
      },
    })

    await client.send({
      from: `BudgetFlow <${opts.gmailUser}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })

    await client.close()
    return { sent: true }
  } catch (e) {
    return { sent: false, error: String(e) }
  }
}

function buildEmailHtml(displayName: string, items: NotificationItem[], type: "alert" | "weekly", weeklySummary?: { income: number; expense: number; net: number; txCount: number }): string {
  const name = displayName || "Kullanıcı"
  const greeting = type === "weekly" ? `Merhaba ${name}, haftalık finans özeten hazır!` : `Merhaba ${name}, önemli bildirimler var.`

  const itemRows = items
    .slice(0, 8)
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:18px;margin-right:8px;">${severityEmoji(item.severity)}</span>
          <strong style="color:#1a1a2e;">${item.title}</strong><br/>
          <span style="color:#666;font-size:14px;">${item.body}</span>
        </td>
        ${item.value ? `<td style="padding:10px 0;text-align:right;color:#7c3aed;font-weight:700;white-space:nowrap;border-bottom:1px solid #f0f0f0;">${item.value}</td>` : "<td></td>"}
      </tr>`
    )
    .join("")

  const summaryBlock =
    type === "weekly" && weeklySummary
      ? `
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 12px;color:#1a1a2e;">Haftalık Özet (Son 7 Gün)</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#10b981;font-weight:700;">Gelir</td>
            <td style="text-align:right;color:#10b981;font-weight:700;">${weeklySummary.income.toFixed(2)} TL</td>
          </tr>
          <tr>
            <td style="color:#ef4444;font-weight:700;">Gider</td>
            <td style="text-align:right;color:#ef4444;font-weight:700;">${weeklySummary.expense.toFixed(2)} TL</td>
          </tr>
          <tr style="border-top:1px solid #ddd;">
            <td style="color:#7c3aed;font-weight:800;padding-top:8px;">Net</td>
            <td style="text-align:right;color:${weeklySummary.net >= 0 ? "#10b981" : "#ef4444"};font-weight:800;padding-top:8px;">${weeklySummary.net.toFixed(2)} TL</td>
          </tr>
        </table>
        <p style="color:#888;font-size:13px;margin:8px 0 0;">${weeklySummary.txCount} işlem gerçekleşti.</p>
      </div>`
      : ""

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#7c3aed;margin:0;font-size:28px;">BudgetFlow</h1>
        <p style="color:#888;margin:4px 0 0;font-size:14px;">Kişisel Finans Takip Sistemi</p>
      </div>
      <h2 style="color:#1a1a2e;font-size:18px;margin-bottom:8px;">${greeting}</h2>
      ${summaryBlock}
      ${
        items.length > 0
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
          ${itemRows}
        </table>`
          : `<p style="color:#666;">Şu an aktif uyarı bulunmuyor. Harika gidiyorsunuz!</p>`
      }
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;">
        <p style="color:#bbb;font-size:12px;margin:0;">
          Bu bildirimi BudgetFlow üzerinden yönetebilirsiniz.<br/>
          Hesap → Bildirim Ayarları
        </p>
      </div>
    </body>
    </html>`
}

// ── SMS via Twilio ────────────────────────────────────────────────────────────

async function sendSms(opts: {
  to: string
  body: string
  accountSid: string
  authToken: string
  fromNumber: string
}): Promise<{ sent: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({
      To: opts.to,
      From: opts.fromNumber,
      Body: opts.body,
    })
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${opts.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${opts.accountSid}:${opts.authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
    if (!res.ok) {
      const err = await res.text()
      return { sent: false, error: err }
    }
    return { sent: true }
  } catch (e) {
    return { sent: false, error: String(e) }
  }
}

function buildSmsText(displayName: string, items: NotificationItem[], type: "alert" | "weekly", weeklySummary?: { income: number; expense: number; net: number }): string {
  const name = displayName || "Kullanıcı"
  if (type === "weekly") {
    const s = weeklySummary!
    return (
      `BudgetFlow Haftalık Özet — ${name}\n` +
      `Gelir: ${s.income.toFixed(0)} TL | Gider: ${s.expense.toFixed(0)} TL | Net: ${s.net.toFixed(0)} TL\n` +
      (items.length > 0 ? `Uyarı: ${items[0].title}` : "Her şey yolunda!")
    )
  }

  const critical = items.filter((i) => i.severity === "danger" || i.severity === "warning").slice(0, 3)
  if (critical.length === 0) return `BudgetFlow: ${name}, şu an aktif uyarı yok.`
  return (
    `BudgetFlow Uyarı — ${name}\n` +
    critical.map((i) => `${severityEmoji(i.severity)} ${i.title}: ${i.body}`).join("\n")
  )
}

// ── Main Handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const gmailUser = Deno.env.get("GMAIL_USER") || ""
  const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD") || ""
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID") || ""
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN") || ""
  const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER") || ""

  const db = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json().catch(() => ({}))
    // type: "alert" (triggered manually or on event) | "weekly" (cron)
    const notifType: "alert" | "weekly" = body.type === "weekly" ? "weekly" : "alert"
    // user_id: optional — if omitted, process all users (cron mode)
    const targetUserId: string | null = body.user_id || null

    const authHeader = req.headers.get("authorization") || ""
    // Allow service-role calls (cron) or authenticated users
    const isServiceCall = authHeader.includes(supabaseServiceKey) || !authHeader

    // When called by an authenticated user, extract their user_id
    let callerUserId: string | null = null
    if (authHeader.startsWith("Bearer ") && !isServiceCall) {
      const token = authHeader.replace("Bearer ", "")
      const { data: { user } } = await db.auth.getUser(token)
      callerUserId = user?.id || null
    }

    const effectiveUserId = targetUserId || callerUserId

    // Fetch profiles to process
    let profileQuery = db
      .from("profiles")
      .select("user_id, display_name, notification_email, notification_sms, phone_number, timezone, currency")

    if (effectiveUserId) {
      profileQuery = profileQuery.eq("user_id", effectiveUserId)
    } else if (!isServiceCall) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }
    // Filter only users who have at least one notification channel enabled
    profileQuery = profileQuery.or("notification_email.eq.true,notification_sms.eq.true")

    const { data: profiles, error: profileErr } = await profileQuery
    if (profileErr) throw profileErr

    const results: Record<string, SendResult> = {}

    for (const profile of (profiles as Profile[]) || []) {
      const uid = profile.user_id
      const result: SendResult = {}

      // Fetch user's financial data
      const [txRes, catRes, goalRes, ruleRes, debtRes, emailRes] = await Promise.all([
        db.from("transactions").select("type,amount,category_id,transaction_date").eq("user_id", uid),
        db.from("categories").select("id,name,is_income,monthly_budget,is_archived").eq("user_id", uid),
        db.from("goals").select("id,name,target_amount,current_amount,is_archived").eq("user_id", uid),
        db.from("recurring_rules").select("id,name,type,amount,next_date,is_active").eq("user_id", uid),
        db.from("debts").select("id,person_name,amount,direction,due_date,is_settled").eq("user_id", uid),
        db.auth.admin.getUserById(uid),
      ])

      const userEmail = emailRes.data?.user?.email || null

      const notifications = buildNotificationsFromData({
        transactions: txRes.data || [],
        categories: catRes.data || [],
        goals: goalRes.data || [],
        recurringRules: ruleRes.data || [],
        debts: debtRes.data || [],
      })

      const weeklySummary = buildWeeklySummary({ transactions: txRes.data || [] })

      // Skip if alert mode and no critical notifications
      if (notifType === "alert" && notifications.filter((n) => n.severity === "danger" || n.severity === "warning").length === 0) {
        results[uid] = { email: { sent: false, error: "no_critical_items" }, sms: { sent: false, error: "no_critical_items" } }
        continue
      }

      // Send email
      if (profile.notification_email && userEmail && gmailUser && gmailAppPassword) {
        const subject =
          notifType === "weekly"
            ? `BudgetFlow Haftalık Özet — ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}`
            : `BudgetFlow Uyarı: ${notifications[0]?.title || "Yeni bildirimler var"}`

        result.email = await sendEmail({
          to: userEmail,
          subject,
          html: buildEmailHtml(profile.display_name || "", notifications, notifType, weeklySummary),
          gmailUser,
          gmailAppPassword,
        })
      }

      // Send SMS
      if (profile.notification_sms && profile.phone_number && twilioSid && twilioToken && twilioFrom) {
        result.sms = await sendSms({
          to: profile.phone_number,
          body: buildSmsText(profile.display_name || "", notifications, notifType, weeklySummary),
          accountSid: twilioSid,
          authToken: twilioToken,
          fromNumber: twilioFrom,
        })
      }

      // Log to notification_logs table
      await db.from("notification_logs").insert({
        user_id: uid,
        type: notifType,
        notification_count: notifications.length,
        email_sent: result.email?.sent ?? false,
        sms_sent: result.sms?.sent ?? false,
        email_error: result.email?.error ?? null,
        sms_error: result.sms?.error ?? null,
      })

      results[uid] = result
    }

    return Response.json({ ok: true, processed: Object.keys(results).length, results }, { headers: corsHeaders })
  } catch (err) {
    console.error("send-notifications error:", err)
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders })
  }
})
