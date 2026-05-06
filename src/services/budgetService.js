import {
  INIT_AI_INSIGHTS,
  INIT_CATS,
  INIT_GOAL_CONTRIBUTIONS,
  INIT_GOALS,
  INIT_RECURRING_RULES,
  INIT_TXS,
  LEGACY_DEMO_DESCRIPTIONS,
  LEGACY_RECURRING_RULES,
} from "../constants/seedData"
import { supabase } from "../lib/supabase"

const AVATAR_SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 30
const AVATAR_SIGNED_URL_CACHE_TTL_MS = 25 * 60 * 1000
const avatarSignedUrlCache = new Map()

const toCategory = (row) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  isIncome: row.is_income,
  budget: Number(row.monthly_budget || 0),
  icon: row.icon || (row.is_income ? "Gelir" : "Gider"),
  isArchived: Boolean(row.is_archived),
})

const toTransaction = (row) => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount || 0),
  date: row.transaction_date,
  cat: row.category_id,
  desc: row.description || "",
  paymentMethod: row.payment_method || "Kart",
  tags: Array.isArray(row.tags) ? row.tags : [],
  source: row.source || "manual",
  recurringRuleId: row.recurring_rule_id || null,
  originalCurrency: row.original_currency || "TRY",
  originalAmount: row.original_amount != null ? Number(row.original_amount) : null,
  location: row.location || "",
  creditCardId: row.credit_card_id || "",
  creditCardStatementId: row.credit_card_statement_id || "",
})

const fromCategory = (category, userId) => ({
  user_id: userId,
  name: category.name,
  color: category.color,
  is_income: category.isIncome,
  monthly_budget: category.budget || 0,
  icon: category.icon || (category.isIncome ? "Gelir" : "Gider"),
  is_archived: Boolean(category.isArchived),
})

const fromTransaction = (transaction, userId) => ({
  user_id: userId,
  category_id: transaction.cat,
  type: transaction.type,
  amount: transaction.amount,
  transaction_date: transaction.date,
  description: transaction.desc || null,
  payment_method: transaction.paymentMethod || "Kart",
  tags: transaction.tags || [],
  source: transaction.source || "manual",
  recurring_rule_id: transaction.recurringRuleId || null,
  original_currency: transaction.originalCurrency || "TRY",
  original_amount: transaction.originalAmount ?? null,
  location: transaction.location || null,
  credit_card_id: transaction.creditCardId || null,
  credit_card_statement_id: transaction.creditCardStatementId || null,
})

const fromLegacyTransaction = (transaction, userId) => ({
  user_id: userId,
  category_id: transaction.cat,
  type: transaction.type,
  amount: transaction.amount,
  transaction_date: transaction.date,
  description: transaction.desc || null,
})

const toGoal = (row) => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount || 0),
  currentAmount: Number(row.current_amount || 0),
  targetDate: row.target_date || "",
  color: row.color || "#10b981",
  isArchived: Boolean(row.is_archived),
})

const fromGoal = (goal, userId) => ({
  user_id: userId,
  name: goal.name,
  target_amount: goal.targetAmount || 0,
  current_amount: goal.currentAmount || 0,
  target_date: goal.targetDate || null,
  color: goal.color || "#10b981",
  is_archived: Boolean(goal.isArchived),
})

const toContribution = (row) => ({
  id: row.id,
  goalId: row.goal_id,
  amount: Number(row.amount || 0),
  date: row.contribution_date,
  note: row.note || "",
})

const toRecurringRule = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  amount: Number(row.amount || 0),
  cat: row.category_id,
  frequency: row.frequency,
  dayOfMonth: row.day_of_month || 1,
  nextDate: row.next_date,
  desc: row.description || "",
  paymentMethod: row.payment_method || "Kart",
  isActive: Boolean(row.is_active),
})

const fromRecurringRule = (rule, userId) => ({
  user_id: userId,
  name: rule.name,
  type: rule.type,
  amount: rule.amount || 0,
  category_id: rule.cat,
  frequency: rule.frequency || "monthly",
  day_of_month: rule.dayOfMonth || 1,
  next_date: rule.nextDate,
  description: rule.desc || null,
  payment_method: rule.paymentMethod || "Kart",
  is_active: rule.isActive !== false,
})

const toAiInsight = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  body: row.body,
  severity: row.severity || "info",
  createdAt: row.created_at,
})

const toAiMessage = (row) => ({
  id: row.id,
  conversationId: row.conversation_id || "",
  role: row.role,
  content: row.content,
  createdAt: row.created_at,
})

const toSubscription = (row) => ({
  id: row.id,
  planId: row.plan_id || "free",
  status: row.status || "active",
  billingInterval: row.billing_interval || "monthly",
  currentPeriodStart: row.current_period_start || "",
  currentPeriodEnd: row.current_period_end || "",
  cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
  provider: row.provider || "manual",
  providerSubscriptionId: row.provider_subscription_id || "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const defaultSubscription = () => ({
  id: "",
  planId: "free",
  status: "active",
  billingInterval: "monthly",
  currentPeriodStart: new Date().toISOString().slice(0, 10),
  currentPeriodEnd: "",
  cancelAtPeriodEnd: false,
  provider: "manual",
  providerSubscriptionId: "",
})

const toReceipt = (row) => ({
  id: row.id,
  transactionId: row.transaction_id || "",
  filePath: row.file_path,
  fileName: row.file_name,
  fileType: row.file_type || "",
  fileSize: Number(row.file_size || 0),
  merchant: row.merchant || "",
  amount: Number(row.amount || 0),
  date: row.receipt_date || "",
  paymentMethod: row.payment_method || "Kart",
  notes: row.notes || "",
  confidence: Number(row.scan_confidence || 0),
  items: Array.isArray(row.receipt_items) ? row.receipt_items.map(toReceiptItem) : [],
  createdAt: row.created_at,
})

const toReceiptItem = (row) => ({
  id: row.id,
  receiptId: row.receipt_id,
  name: row.name || "",
  quantity: Number(row.quantity || 0),
  unitPrice: Number(row.unit_price || 0),
  totalPrice: Number(row.total_price || 0),
  createdAt: row.created_at,
})

const fromReceiptItem = (item, userId, receiptId) => {
  const quantity = Number(item.qty ?? item.quantity ?? 1)
  const unitPrice = Number(item.unitPrice ?? item.unit_price ?? 0)
  const totalPrice = Number(item.totalPrice ?? item.total_price ?? (quantity * unitPrice))
  return {
    user_id: userId,
    receipt_id: receiptId,
    name: String(item.name || "").trim(),
    quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 1,
    unit_price: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
    total_price: Number.isFinite(totalPrice) && totalPrice >= 0 ? totalPrice : 0,
  }
}

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

const isUniqueViolation = (error) => error?.code === "23505"

const optionalRows = (result) => {
  if (!result.error) return result.data || []
  if (isSchemaMissing(result.error)) return []
  throw result.error
}

const monthKey = (date) => date.slice(0, 7)

const shiftedSeedDate = (date, monthMap) => {
  const nextMonth = monthMap.get(monthKey(date))
  return nextMonth ? `${nextMonth}-${date.slice(8, 10)}` : date
}

const buildSeedMonthMap = () => {
  const sourceMonths = [...new Set(INIT_TXS.map((transaction) => monthKey(transaction.date)))].sort()
  const targetMonths = Array.from({ length: sourceMonths.length }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (sourceMonths.length - 1 - index))
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  })

  return new Map(sourceMonths.map((sourceMonth, index) => [sourceMonth, targetMonths[index]]))
}

const futureDate = (monthsFromNow, day = 1) => {
  const date = new Date()
  date.setDate(day)
  date.setMonth(date.getMonth() + monthsFromNow)
  return date.toISOString().slice(0, 10)
}

const dateOffset = (daysFromToday) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

const advanceRecurringDate = (dateString, frequency) => {
  const date = new Date(`${dateString}T12:00:00`)
  if (frequency === "weekly") date.setDate(date.getDate() + 7)
  else date.setMonth(date.getMonth() + 1)
  return date.toISOString().slice(0, 10)
}

const categoryDedupeKey = (category) =>
  `${String(category.name || "").trim().toLocaleLowerCase("tr-TR")}:${Boolean(category.is_income)}`

const PROFILE_COLS = "id,user_id,display_name,currency,seeded_at,created_at,updated_at,monthly_income_target,locale,timezone,two_factor_enabled,notification_email,notification_push,notification_sms,phone_number,avatar_url,is_banned"

async function ensureProfile(user) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw error
  if (profile) return profile

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "BudgetAssist"
  const { data, error: insertError } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      display_name: displayName,
      currency: "TRY",
    })
    .select()
    .single()

  if (insertError) throw insertError
  return data
}

async function ensureUserSubscription(userId) {
  const { data: existing, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    if (isSchemaMissing(error)) return defaultSubscription()
    throw error
  }
  if (existing) return toSubscription(existing)

  const now = new Date()
  const periodEnd = addMonths(now, 1)
  const { data, error: insertError } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan_id: "free",
      status: "active",
      billing_interval: "monthly",
      current_period_start: now.toISOString().slice(0, 10),
      current_period_end: periodEnd.toISOString().slice(0, 10),
      provider: "manual",
    })
    .select()
    .single()

  if (insertError) {
    if (isSchemaMissing(insertError)) return defaultSubscription()
    throw insertError
  }
  return toSubscription(data)
}

function addMonths(date, months) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

async function seedUserData(userId) {
  const categoryIdMap = new Map()
  const seedMonthMap = buildSeedMonthMap()

  for (const category of INIT_CATS) {
    const data = await insertSeedCategory(userId, category)
    categoryIdMap.set(category.id, data.id)
  }

  await insertSeedTransactions(userId, categoryIdMap, seedMonthMap, [])

  await seedPresentationData(userId, categoryIdMap)

  const { error } = await supabase
    .from("profiles")
    .update({ seeded_at: new Date().toISOString() })
    .eq("user_id", userId)

  if (error) throw error
}

async function insertSeedCategory(userId, category) {
  let { data, error } = await supabase
    .from("categories")
    .insert(fromCategory(category, userId))
    .select()
    .single()

  if (error && isSchemaMissing(error)) {
    const legacy = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: category.name,
        color: category.color,
        is_income: category.isIncome,
        monthly_budget: category.budget || 0,
      })
      .select()
      .single()
    data = legacy.data
    error = legacy.error
  }

  if (error) throw error
  return data
}

async function insertSeedTransactions(userId, categoryIdMap, seedMonthMap, existingTransactions) {
  const existingDescriptions = new Set(existingTransactions.map((tx) => tx.description || tx.desc))
  const seededTransactions = INIT_TXS
    .filter((transaction) => !existingDescriptions.has(transaction.desc))
    .map((transaction) =>
      fromTransaction(
        {
          ...transaction,
          cat: categoryIdMap.get(transaction.cat),
          date: shiftedSeedDate(transaction.date, seedMonthMap),
        },
        userId
      )
    )
    .filter((transaction) => transaction.category_id)

  if (seededTransactions.length === 0) return

  let { error } = await supabase.from("transactions").insert(seededTransactions)

  if (error && isSchemaMissing(error)) {
    const legacyRows = seededTransactions.map((transaction) => ({
      user_id: transaction.user_id,
      category_id: transaction.category_id,
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      description: transaction.description,
    }))
    const legacy = await supabase.from("transactions").insert(legacyRows)
    error = legacy.error
  }

  if (error) throw error
}

async function ensureCoreDemoData(userId, categories, transactions) {
  const categoryIdMap = new Map()
  for (const category of INIT_CATS) {
    const match = categories.find(
      (item) =>
        item.name.trim().toLocaleLowerCase("tr-TR") === category.name.toLocaleLowerCase("tr-TR") &&
        Boolean(item.is_income) === Boolean(category.isIncome)
    )
    if (match) {
      categoryIdMap.set(category.id, match.id)
      continue
    }

    const inserted = await insertSeedCategory(userId, category)
    categoryIdMap.set(category.id, inserted.id)
  }

  if (transactions.length < INIT_TXS.length) {
    await insertSeedTransactions(userId, categoryIdMap, buildSeedMonthMap(), transactions)
  }
}

async function dedupeCategories(userId, categories, transactions, recurringRows) {
  const groups = new Map()
  categories.forEach((category) => {
    const key = categoryDedupeKey(category)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(category)
  })

  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1)
  if (duplicateGroups.length === 0) return false

  const transactionRefs = new Map()
  transactions.forEach((tx) => {
    transactionRefs.set(tx.category_id, (transactionRefs.get(tx.category_id) || 0) + 1)
  })
  recurringRows.forEach((rule) => {
    transactionRefs.set(rule.category_id, (transactionRefs.get(rule.category_id) || 0) + 1)
  })

  for (const group of duplicateGroups) {
    const [keeper, ...duplicates] = [...group].sort((a, b) => {
      const refDelta = (transactionRefs.get(b.id) || 0) - (transactionRefs.get(a.id) || 0)
      if (refDelta !== 0) return refDelta
      return String(a.created_at || "").localeCompare(String(b.created_at || ""))
    })
    const duplicateIds = duplicates.map((category) => category.id)

    const { error: txError } = await supabase
      .from("transactions")
      .update({ category_id: keeper.id })
      .eq("user_id", userId)
      .in("category_id", duplicateIds)
    if (txError) throw txError

    const recurringUpdate = await supabase
      .from("recurring_rules")
      .update({ category_id: keeper.id })
      .eq("user_id", userId)
      .in("category_id", duplicateIds)
    if (recurringUpdate.error && !isSchemaMissing(recurringUpdate.error)) throw recurringUpdate.error

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId)
      .in("id", duplicateIds)
    if (deleteError) throw deleteError
  }

  return true
}

async function pruneLegacyDemoTransactions(userId, profile, transactions) {
  if (!profile?.seeded_at || transactions.length <= INIT_TXS.length + 4) return false

  const keepDescriptions = new Set(INIT_TXS.map((tx) => tx.desc))
  const removableDescriptions = new Set(
    LEGACY_DEMO_DESCRIPTIONS.filter((desc) => !keepDescriptions.has(desc))
  )
  const removableIds = transactions
    .filter((tx) => removableDescriptions.has(tx.description || tx.desc))
    .map((tx) => tx.id)

  if (removableIds.length === 0) return false

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId)
    .in("id", removableIds)

  if (error) throw error
  return true
}

async function seedPresentationData(userId, categoryIdMap) {
  const goalIdMap = new Map()

  const { data: goals, error: goalError } = await supabase
    .from("goals")
    .insert(
      INIT_GOALS.map((goal) => ({
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        target_date: futureDate(goal.targetDateOffsetMonths, 1),
        color: goal.color,
      }))
    )
    .select()

  if (goalError) {
    if (isSchemaMissing(goalError)) return
    throw goalError
  }

  INIT_GOALS.forEach((goal, index) => {
    if (goals?.[index]?.id) goalIdMap.set(goal.id, goals[index].id)
  })

  const contributionRows = INIT_GOAL_CONTRIBUTIONS
    .map((item) => ({
      user_id: userId,
      goal_id: goalIdMap.get(item.goal),
      amount: item.amount,
      contribution_date: dateOffset(item.dateOffsetDays),
      note: item.note,
    }))
    .filter((item) => item.goal_id)

  if (contributionRows.length > 0) {
    const { error } = await supabase.from("goal_contributions").insert(contributionRows)
    if (error && !isSchemaMissing(error)) throw error
  }

  const recurringRows = INIT_RECURRING_RULES
    .map((rule) => ({
      user_id: userId,
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      category_id: categoryIdMap.get(rule.cat),
      frequency: rule.frequency,
      day_of_month: rule.dayOfMonth,
      next_date: futureDate(1, rule.dayOfMonth),
      description: rule.desc,
      payment_method: rule.paymentMethod,
      is_active: true,
    }))
    .filter((rule) => rule.category_id)

  if (recurringRows.length > 0) {
    const { error } = await supabase.from("recurring_rules").insert(recurringRows)
    if (error && !isSchemaMissing(error)) throw error
  }

  const { error: insightError } = await supabase.from("ai_insights").insert(
    INIT_AI_INSIGHTS.map((insight) => ({
      user_id: userId,
      type: insight.type,
      title: insight.title,
      body: insight.body,
      severity: insight.severity,
    }))
  )
  if (insightError && !isSchemaMissing(insightError)) throw insightError

  const { error: messageError } = await supabase.from("ai_messages").insert([
    {
      user_id: userId,
      role: "assistant",
      content:
        "Demo veriniz hazır. Şimdilik yerel analiz modundayım; Groq Edge Function bağlandığında daha derin kişisel öneriler verebilirim.",
    },
  ])
  if (messageError && !isSchemaMissing(messageError)) throw messageError
}

async function ensurePresentationData(userId, categories, rows) {
  if (categories.length === 0) return rows
  const hasPresentationData =
    rows.goalRows.length > 0 ||
    rows.recurringRows.length > 0 ||
    rows.insightRows.length > 0

  if (hasPresentationData) return rows

  const categoryIdMap = new Map()
  INIT_CATS.forEach((seedCat) => {
    const match = categories.find((cat) => cat.name === seedCat.name)
    if (match) categoryIdMap.set(seedCat.id, match.id)
  })

  if (categoryIdMap.size === 0) return rows

  await seedPresentationData(userId, categoryIdMap)

  const [goalsResult, contributionsResult, recurringResult, insightsResult, messagesResult] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("goal_contributions").select("*").eq("user_id", userId).order("contribution_date", { ascending: false }),
    supabase.from("recurring_rules").select("*").eq("user_id", userId).order("next_date", { ascending: true }),
    supabase.from("ai_insights").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    supabase.from("ai_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true }).limit(50),
  ])

  return {
    goalRows: optionalRows(goalsResult),
    contributionRows: optionalRows(contributionsResult),
    recurringRows: optionalRows(recurringResult),
    insightRows: optionalRows(insightsResult),
    messageRows: optionalRows(messagesResult),
  }
}

async function ensureSubscriptionRules(userId, categories, recurringRows) {
  const legacyNames = new Set(LEGACY_RECURRING_RULES)
  const legacyRows = recurringRows.filter((row) => legacyNames.has(row.name))
  if (legacyRows.length > 0) {
    const { error } = await supabase
      .from("recurring_rules")
      .delete()
      .eq("user_id", userId)
      .in("id", legacyRows.map((row) => row.id))
    if (error) throw error
    recurringRows = recurringRows.filter((row) => !legacyNames.has(row.name))
  }

  const categoryIdMap = new Map()
  INIT_CATS.forEach((seedCat) => {
    const match = categories.find((cat) => cat.name === seedCat.name)
    if (match) categoryIdMap.set(seedCat.id, match.id)
  })

  const existingNames = new Set(recurringRows.map((row) => row.name))
  const missingRows = INIT_RECURRING_RULES
    .filter((rule) => !existingNames.has(rule.name))
    .map((rule) => ({
      user_id: userId,
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      category_id: categoryIdMap.get(rule.cat),
      frequency: rule.frequency,
      day_of_month: rule.dayOfMonth,
      next_date: futureDate(1, rule.dayOfMonth),
      description: rule.desc,
      payment_method: rule.paymentMethod,
      is_active: true,
    }))
    .filter((rule) => rule.category_id)

  if (missingRows.length === 0) return recurringRows

  const { data, error } = await supabase
    .from("recurring_rules")
    .insert(missingRows)
    .select("*")

  if (error && !isSchemaMissing(error)) throw error
  return [...recurringRows, ...optionalRows({ data, error })]
}

async function materializeDueRecurringRules(userId, recurringRows, transactionRows) {
  const today = new Date().toISOString().slice(0, 10)
  const existingKeys = new Set(
    transactionRows
      .filter((tx) => tx.recurring_rule_id)
      .map((tx) => `${tx.recurring_rule_id}:${tx.transaction_date}`)
  )
  const createdRows = []
  const updates = []

  for (const row of recurringRows.filter((rule) => rule.is_active && rule.next_date <= today)) {
    let nextDate = row.next_date
    let guard = 0

    while (nextDate <= today && guard < 24) {
      const key = `${row.id}:${nextDate}`
      if (!existingKeys.has(key)) {
        const payload = {
          user_id: userId,
          category_id: row.category_id,
          type: row.type,
          amount: row.amount,
          transaction_date: nextDate,
          description: row.description || row.name,
          payment_method: row.payment_method || "Kart",
          tags: ["tekrarlı", "otomatik"],
          source: "recurring",
          recurring_rule_id: row.id,
        }
        const { data, error } = await supabase.from("transactions").insert(payload).select().single()
        if (error) {
          if (!isUniqueViolation(error)) throw error
        } else {
          createdRows.push(data)
        }
        existingKeys.add(key)
      }
      nextDate = advanceRecurringDate(nextDate, row.frequency)
      guard += 1
    }

    if (nextDate !== row.next_date) {
      updates.push({ id: row.id, nextDate })
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("recurring_rules")
      .update({ next_date: update.nextDate })
      .eq("id", update.id)
      .eq("user_id", userId)
    if (error) throw error
  }

  return createdRows.length
}

export async function loadBudgetData(user) {
  await ensureProfile(user)
  const subscription = await ensureUserSubscription(user.id)

  let [
    categoriesResult,
    transactionsResult,
    profileResult,
    goalsResult,
    contributionsResult,
    recurringResult,
    insightsResult,
    messagesResult,
    receiptsResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select(PROFILE_COLS)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_contributions")
      .select("*")
      .eq("user_id", user.id)
      .order("contribution_date", { ascending: false }),
    supabase
      .from("recurring_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("next_date", { ascending: true }),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50),
    supabase
      .from("receipts")
      .select("*, receipt_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (categoriesResult.error) throw categoriesResult.error
  if (transactionsResult.error) throw transactionsResult.error
  if (profileResult.error) throw profileResult.error

  const dedupedCategories = await dedupeCategories(
    user.id,
    categoriesResult.data,
    transactionsResult.data,
    optionalRows(recurringResult)
  )
  if (dedupedCategories) {
    const [nextCategoriesResult, nextTransactionsResult, nextRecurringResult] = await Promise.all([
      supabase.from("categories").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("recurring_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("next_date", { ascending: true }),
    ])

    if (nextCategoriesResult.error) throw nextCategoriesResult.error
    if (nextTransactionsResult.error) throw nextTransactionsResult.error
    if (nextRecurringResult.error && !isSchemaMissing(nextRecurringResult.error)) throw nextRecurringResult.error
    categoriesResult = nextCategoriesResult
    transactionsResult = nextTransactionsResult
    recurringResult = nextRecurringResult
  }

  const prunedLegacyRows = await pruneLegacyDemoTransactions(user.id, profileResult.data, transactionsResult.data)
  if (prunedLegacyRows) {
    const nextTransactionsResult = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (nextTransactionsResult.error) throw nextTransactionsResult.error
    transactionsResult = nextTransactionsResult
  }

  const createdRecurringCount = await materializeDueRecurringRules(
    user.id,
    optionalRows(recurringResult),
    transactionsResult.data
  )

  if (createdRecurringCount > 0) {
    const [nextTransactionsResult, nextRecurringResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("recurring_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("next_date", { ascending: true }),
    ])

    if (nextTransactionsResult.error) throw nextTransactionsResult.error
    if (nextRecurringResult.error) throw nextRecurringResult.error
    transactionsResult = nextTransactionsResult
    recurringResult = nextRecurringResult
  }

  if (receiptsResult.error && isSchemaMissing(receiptsResult.error)) {
    receiptsResult = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  }

  const goalRows = optionalRows(goalsResult)
  const contributionRows = optionalRows(contributionsResult)
  let recurringRows = optionalRows(recurringResult)
  const insightRows = optionalRows(insightsResult)
  const messageRows = optionalRows(messagesResult)
  const receiptRows = optionalRows(receiptsResult)
  const categoryRows = categoriesResult.data.map(toCategory)

  return {
    profile: profileResult.data,
    cats: categoryRows,
    txs: transactionsResult.data.map(toTransaction),
    goals: goalRows.map(toGoal),
    contributions: contributionRows.map(toContribution),
    recurringRules: recurringRows.map(toRecurringRule),
    aiInsights: insightRows.map(toAiInsight),
    aiMessages: messageRows.map(toAiMessage),
    receipts: receiptRows.map(toReceipt),
    subscription,
  }
}

export async function saveUserSubscription(userId, values) {
  if (!userId) throw new Error("userId gerekli")
  const planId = ["free", "standard", "premium"].includes(values.planId) ? values.planId : "free"
  const billingInterval = ["monthly", "yearly"].includes(values.billingInterval) ? values.billingInterval : "monthly"
  const now = new Date()
  const periodMonths = billingInterval === "yearly" ? 12 : 1
  const periodEnd = addMonths(now, periodMonths)

  const payload = {
    user_id: userId,
    plan_id: planId,
    status: values.status || "active",
    billing_interval: billingInterval,
    current_period_start: now.toISOString().slice(0, 10),
    current_period_end: periodEnd.toISOString().slice(0, 10),
    cancel_at_period_end: Boolean(values.cancelAtPeriodEnd),
    provider: values.provider || "manual",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("user_subscriptions")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single()

  if (error) {
    if (isSchemaMissing(error)) throw new Error("Abonelik tablosu hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın.")
    throw error
  }
  return toSubscription(data)
}

export async function saveTransaction(userId, transaction, editId) {
  if (!userId) throw new Error("userId gerekli")
  if (!transaction.cat) throw new Error("Kategori seçilmesi zorunludur")
  if (!transaction.date) throw new Error("Tarih girilmesi zorunludur")
  const amount = Number(transaction.amount)
  if (!isFinite(amount) || amount < 0) throw new Error("Geçersiz tutar")
  const payload = fromTransaction({ ...transaction, amount }, userId)
  if (editId) {
    const { data: previousRow, error: previousError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", editId)
      .eq("user_id", userId)
      .maybeSingle()
    if (previousError && !isSchemaMissing(previousError)) throw previousError

    let { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", editId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error && isSchemaMissing(error)) {
      const legacy = await supabase
        .from("transactions")
        .update(fromLegacyTransaction(transaction, userId))
        .eq("id", editId)
        .eq("user_id", userId)
        .select()
        .single()
      data = legacy.data
      error = legacy.error
    }

    if (error) throw error
    await syncCreditCardDebtForTransactionChange(userId, previousRow ? toTransaction(previousRow) : null, toTransaction(data))
    return toTransaction(data)
  }

  let { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select()
    .single()

  if (error && isSchemaMissing(error)) {
    const legacy = await supabase
      .from("transactions")
      .insert(fromLegacyTransaction(transaction, userId))
      .select()
      .single()
    data = legacy.data
    error = legacy.error
  }

  if (error) throw error
  await syncCreditCardDebtForTransactionChange(userId, null, toTransaction(data))
  return toTransaction(data)
}

export async function saveTransactions(userId, transactions) {
  if (transactions.length === 0) return []

  const payload = transactions.map((transaction) => fromTransaction(transaction, userId))
  let { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select()

  if (error && isSchemaMissing(error)) {
    const legacy = await supabase
      .from("transactions")
      .insert(transactions.map((transaction) => fromLegacyTransaction(transaction, userId)))
      .select()
    data = legacy.data
    error = legacy.error
  }

  if (error) throw error
  return (data || []).map(toTransaction)
}

export async function deleteTransaction(userId, id) {
  const { data: previousRow, error: previousError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()
  if (previousError && !isSchemaMissing(previousError)) throw previousError

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
  await syncCreditCardDebtForTransactionChange(userId, previousRow ? toTransaction(previousRow) : null, null)
}

export async function deleteTransactions(userId, ids) {
  if (ids.length === 0) return
  const { data: previousRows, error: previousError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .in("id", ids)
  if (previousError && !isSchemaMissing(previousError)) throw previousError

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId)
    .in("id", ids)

  if (error) throw error
  for (const row of previousRows || []) {
    await syncCreditCardDebtForTransactionChange(userId, toTransaction(row), null)
  }
}

export async function updateTransactions(userId, ids, patch) {
  if (ids.length === 0) return []

  const payload = {}
  if (patch.type) payload.type = patch.type
  if (patch.cat) payload.category_id = patch.cat
  if (patch.paymentMethod) payload.payment_method = patch.paymentMethod
  if (patch.tags) payload.tags = patch.tags

  if (Object.keys(payload).length === 0) return []

  let { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("user_id", userId)
    .in("id", ids)
    .select()

  if (error && isSchemaMissing(error)) {
    const legacyPayload = {}
    if (patch.type) legacyPayload.type = patch.type
    if (patch.cat) legacyPayload.category_id = patch.cat
    const legacy = await supabase
      .from("transactions")
      .update(legacyPayload)
      .eq("user_id", userId)
      .in("id", ids)
      .select()
    data = legacy.data
    error = legacy.error
  }

  if (error) throw error
  return (data || []).map(toTransaction)
}

async function syncCreditCardDebtForTransactionChange(userId, previousTx, nextTx) {
  const deltas = new Map()
  const addDelta = (cardId, value) => {
    if (!cardId || !value) return
    deltas.set(cardId, (deltas.get(cardId) || 0) + value)
  }

  if (previousTx?.type === "expense") {
    addDelta(previousTx.creditCardId, -Number(previousTx.amount || 0))
  }
  if (nextTx?.type === "expense") {
    addDelta(nextTx.creditCardId, Number(nextTx.amount || 0))
  }

  for (const [cardId, delta] of deltas.entries()) {
    if (!delta) continue
    const { data: card, error } = await supabase
      .from("credit_cards")
      .select("current_debt")
      .eq("id", cardId)
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      if (isSchemaMissing(error)) return
      throw error
    }
    if (!card) continue

    const nextDebt = Math.max(Number(card.current_debt || 0) + delta, 0)
    const { error: updateError } = await supabase
      .from("credit_cards")
      .update({ current_debt: nextDebt, updated_at: new Date().toISOString() })
      .eq("id", cardId)
      .eq("user_id", userId)

    if (updateError && !isSchemaMissing(updateError)) throw updateError
  }
}

export async function saveCategory(userId, category, editId) {
  if (!userId) throw new Error("userId gerekli")
  if (!category.name?.trim()) throw new Error("Kategori adı zorunludur")
  if (!category.color?.trim()) throw new Error("Kategori rengi zorunludur")
  const payload = fromCategory(category, userId)
  const legacyPayload = {
    user_id: userId,
    name: category.name,
    color: category.color,
    is_income: category.isIncome,
    monthly_budget: category.budget || 0,
  }

  if (editId) {
    let { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", editId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error && isSchemaMissing(error)) {
      const legacy = await supabase
        .from("categories")
        .update(legacyPayload)
        .eq("id", editId)
        .eq("user_id", userId)
        .select()
        .single()
      data = legacy.data
      error = legacy.error
    }

    if (error) throw error
    return toCategory(data)
  }

  let { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single()

  if (error && isSchemaMissing(error)) {
    const legacy = await supabase
      .from("categories")
      .insert(legacyPayload)
      .select()
      .single()
    data = legacy.data
    error = legacy.error
  }

  if (error) throw error
  return toCategory(data)
}

export async function deleteCategory(userId, id) {
  let { error } = await supabase
    .from("categories")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("user_id", userId)

  if (error && isSchemaMissing(error)) {
    const legacy = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    error = legacy.error
  }

  if (error) throw error
}

export async function updateProfile(userId, values) {
  let { data, error } = await supabase
    .from("profiles")
    .update(values)
    .eq("user_id", userId)
    .select(PROFILE_COLS)
    .single()

  if (error && isSchemaMissing(error)) {
    const fallbackValues = Object.fromEntries(
      Object.entries(values).filter(([key]) =>
        ["display_name", "monthly_income_target", "currency", "locale", "timezone"].includes(key)
      )
    )
    const fallback = await supabase
      .from("profiles")
      .update(fallbackValues)
      .eq("user_id", userId)
      .select(PROFILE_COLS)
      .single()
    data = fallback.data
    error = fallback.error
  }

  if (error) throw error
  return data
}

export async function saveAvatarFile(userId, file, currentAvatarPath = "") {
  if (!file) throw new Error("Dosya seçilmedi.")
  if (!file.type?.startsWith("image/")) throw new Error("Lütfen bir görsel dosyası seçin.")
  if (file.size > 5 * 1024 * 1024) throw new Error("Avatar görseli en fazla 5 MB olabilir.")

  const safeName = sanitizeStorageName(file.name || "avatar")
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-${safeName}`

  const upload = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

  if (upload.error) {
    throw new Error(
      upload.error.message?.includes("Bucket not found")
        ? "Avatar arşivi hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın."
        : upload.error.message
    )
  }

  let { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: filePath, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select(PROFILE_COLS)
    .single()

  if (error && isSchemaMissing(error)) {
    await supabase.storage.from("avatars").remove([filePath])
    throw new Error("Avatar kolonu hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın.")
  }
  if (error) {
    await supabase.storage.from("avatars").remove([filePath])
    throw error
  }

  if (currentAvatarPath?.startsWith(`${userId}/`) && currentAvatarPath !== filePath) {
    await supabase.storage.from("avatars").remove([currentAvatarPath])
  }

  return data
}

export async function getAvatarUrl(userId, avatarPath) {
  if (!avatarPath || !userId) return ""
  if (!avatarPath.startsWith(`${userId}/`)) return avatarPath

  const cacheKey = `${userId}:${avatarPath}`
  const cached = avatarSignedUrlCache.get(cacheKey)
  const now = Date.now()
  if (cached?.url && cached.expiresAt > now) return cached.url
  if (cached?.promise && cached.expiresAt > now) return cached.promise

  const promise = supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, AVATAR_SIGNED_URL_EXPIRES_IN_SECONDS)
    .then(({ data, error }) => {
      if (error) throw error
      const signedUrl = data?.signedUrl || ""
      if (signedUrl) {
        avatarSignedUrlCache.set(cacheKey, {
          url: signedUrl,
          expiresAt: Date.now() + AVATAR_SIGNED_URL_CACHE_TTL_MS,
        })
      } else {
        avatarSignedUrlCache.delete(cacheKey)
      }
      return signedUrl
    })
    .catch((error) => {
      avatarSignedUrlCache.delete(cacheKey)
      throw error
    })

  avatarSignedUrlCache.set(cacheKey, {
    promise,
    expiresAt: now + AVATAR_SIGNED_URL_CACHE_TTL_MS,
  })
  return promise
}

export async function saveGoal(userId, goal, editId) {
  if (!userId) throw new Error("userId gerekli")
  if (!goal.name?.trim()) throw new Error("Hedef adı zorunludur")
  const targetAmount = Number(goal.targetAmount)
  if (!isFinite(targetAmount) || targetAmount < 0) throw new Error("Geçersiz hedef tutarı")
  const query = editId
    ? supabase.from("goals").update(fromGoal({ ...goal, targetAmount }, userId)).eq("id", editId).eq("user_id", userId)
    : supabase.from("goals").insert(fromGoal({ ...goal, targetAmount }, userId))

  const { data, error } = await query.select().single()
  if (error) throw error
  return toGoal(data)
}

export async function deleteGoal(userId, id) {
  const { error } = await supabase
    .from("goals")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function addGoalContribution(userId, contribution) {
  if (!userId) throw new Error("userId gerekli")
  if (!contribution.goalId) throw new Error("goalId gerekli")
  const amount = Number(contribution.amount)
  if (!isFinite(amount) || amount <= 0) throw new Error("Katkı tutarı sıfırdan büyük olmalıdır")

  let { data, error } = await supabase.rpc("add_goal_contribution", {
    p_goal_id: contribution.goalId,
    p_amount: amount,
    p_contribution_date: contribution.date,
    p_note: contribution.note || null,
  })

  if (!error) return toContribution(data)
  if (!isSchemaMissing(error)) throw error

  const fallback = await supabase
    .from("goal_contributions")
    .insert({
      user_id: userId,
      goal_id: contribution.goalId,
      amount,
      contribution_date: contribution.date,
      note: contribution.note || null,
    })
    .select()
    .single()

  data = fallback.data
  error = fallback.error
  if (error) throw error

  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", contribution.goalId)
    .eq("user_id", userId)
    .single()

  const update = await supabase
    .from("goals")
    .update({ current_amount: Number(goal?.current_amount || 0) + amount })
    .eq("id", contribution.goalId)
    .eq("user_id", userId)

  if (update.error) throw update.error
  return toContribution(data)
}

export async function saveRecurringRule(userId, rule, editId) {
  const query = editId
    ? supabase.from("recurring_rules").update(fromRecurringRule(rule, userId)).eq("id", editId).eq("user_id", userId)
    : supabase.from("recurring_rules").insert(fromRecurringRule(rule, userId))

  const { data, error } = await query.select().single()
  if (error) throw error
  return toRecurringRule(data)
}

export async function createTransactionFromRule(userId, rule) {
  const transaction = await saveTransaction(userId, {
    type: rule.type,
    amount: rule.amount,
    date: new Date().toISOString().slice(0, 10),
    cat: rule.cat,
    desc: rule.desc || rule.name,
    paymentMethod: rule.paymentMethod,
    tags: ["tekrarlı"],
    source: "recurring",
    recurringRuleId: rule.id,
  })

  const nextDate = advanceRecurringDate(rule.nextDate || transaction.date, rule.frequency)

  await supabase
    .from("recurring_rules")
    .update({ next_date: nextDate })
    .eq("id", rule.id)
    .eq("user_id", userId)

  return transaction
}

async function ensureAiConversation(userId, conversationId) {
  if (conversationId) return conversationId

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ user_id: userId, title: "AI Koç" })
    .select("id")
    .single()

  if (error) {
    if (isSchemaMissing(error)) return null
    throw error
  }

  return data?.id || null
}

export async function sendCoachMessage(userId, message, summary, conversationId = null) {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { message, summary },
  })

  const response = error ? buildLocalCoachResponse(message, summary) : data
  const activeConversationId = await ensureAiConversation(userId, conversationId)

  if (response?.reply) {
    const messageRows = [
      { user_id: userId, role: "user", content: message },
      { user_id: userId, role: "assistant", content: response.reply },
    ].map((row) => activeConversationId ? { ...row, conversation_id: activeConversationId } : row)

    let { error: messageError } = await supabase.from("ai_messages").insert(messageRows)
    if (messageError && isSchemaMissing(messageError) && activeConversationId) {
      const fallbackRows = messageRows.map(({ conversation_id, ...row }) => row)
      const fallbackResult = await supabase.from("ai_messages").insert(fallbackRows)
      messageError = fallbackResult.error
    }
    if (messageError && !isSchemaMissing(messageError)) throw messageError
  }

  if (Array.isArray(response?.insights) && response.insights.length > 0) {
    const { error: insightError } = await supabase.from("ai_insights").insert(
      response.insights.map((insight) => ({
        user_id: userId,
        type: insight.type || "coaching",
        title: insight.title,
        body: insight.body,
        severity: insight.severity || "info",
      }))
    )
    if (insightError && !isSchemaMissing(insightError)) throw insightError
  }

  return { ...response, conversationId: activeConversationId }
}

export async function extractReceiptFromImage(imageDataUrl, fileName) {
  const { data, error } = await supabase.functions.invoke("receipt-scanner", {
    body: { imageDataUrl, fileName },
  })

  if (error) throw error
  return data
}

export async function saveReceiptFile(userId, file, metadata = {}) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin"
  const safeName = sanitizeStorageName(file.name)
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-${safeName}`

  const upload = await supabase.storage
    .from("receipts")
    .upload(filePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

  if (upload.error) {
    throw new Error(
      upload.error.message?.includes("Bucket not found")
        ? "Fiş arşivi hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın."
        : upload.error.message
    )
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({
      user_id: userId,
      file_path: filePath,
      file_name: file.name || `${metadata.merchant || "fis"}.${extension}`,
      file_type: file.type || null,
      file_size: file.size || 0,
      merchant: metadata.merchant || null,
      amount: metadata.amount || 0,
      receipt_date: metadata.date || null,
      payment_method: metadata.paymentMethod || "Kart",
      notes: metadata.notes || null,
      scan_confidence: metadata.confidence || 0,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from("receipts").remove([filePath])
    if (isSchemaMissing(error)) {
      throw new Error("Fiş arşivi tablosu hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın.")
    }
    throw error
  }

  const receipt = toReceipt(data)
  const itemRows = Array.isArray(metadata.items)
    ? metadata.items
        .map((item) => fromReceiptItem(item, userId, data.id))
        .filter((item) => item.name)
    : []

  if (itemRows.length === 0) return receipt

  const itemResult = await supabase
    .from("receipt_items")
    .insert(itemRows)
    .select()

  if (itemResult.error) {
    if (isSchemaMissing(itemResult.error)) return receipt
    throw itemResult.error
  }

  return { ...receipt, items: (itemResult.data || []).map(toReceiptItem) }
}

export async function linkReceiptToTransaction(userId, receiptId, transactionId) {
  if (!receiptId || !transactionId) return null
  const { data, error } = await supabase
    .from("receipts")
    .update({ transaction_id: transactionId })
    .eq("id", receiptId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return toReceipt(data)
}

export async function getReceiptUrl(userId, receipt) {
  if (!receipt?.filePath) return ""
  if (!receipt.filePath.startsWith(`${userId}/`)) throw new Error("Bu fişe erişim izniniz yok.")

  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(receipt.filePath, 60 * 10)

  if (error) throw error
  return data?.signedUrl || ""
}

export async function deleteReceiptFile(userId, receipt) {
  if (!receipt?.id) return
  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", receipt.id)
    .eq("user_id", userId)

  if (error) throw error
  if (receipt.filePath?.startsWith(`${userId}/`)) {
    await supabase.storage.from("receipts").remove([receipt.filePath])
  }
}

function sanitizeStorageName(value) {
  return String(value || "receipt")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "receipt"
}

const toDebt = (row) => ({
  id: row.id,
  personName: row.person_name,
  amount: Number(row.amount || 0),
  direction: row.direction,
  description: row.description || "",
  dueDate: row.due_date || "",
  isSettled: Boolean(row.is_settled),
  createdAt: row.created_at,
})

const toDebtPayment = (row) => ({
  id: row.id,
  debtId: row.debt_id,
  amount: Number(row.amount || 0),
  paymentDate: row.payment_date,
  note: row.note || "",
  createdAt: row.created_at,
})

const fromDebt = (debt, userId) => ({
  user_id: userId,
  person_name: debt.personName,
  amount: debt.amount || 0,
  direction: debt.direction,
  description: debt.description || null,
  due_date: debt.dueDate || null,
  is_settled: Boolean(debt.isSettled),
})

export async function loadDebts(userId) {
  const [debtsResult, paymentsResult] = await Promise.all([
    supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("debt_payments")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false }),
  ])

  if (debtsResult.error) {
    if (isSchemaMissing(debtsResult.error)) return { debts: [], debtPayments: [] }
    throw debtsResult.error
  }

  return {
    debts: (debtsResult.data || []).map(toDebt),
    debtPayments: optionalRows(paymentsResult).map(toDebtPayment),
  }
}

export async function saveDebt(userId, debt, editId) {
  if (!userId) throw new Error("userId gerekli")
  if (!debt.personName?.trim()) throw new Error("Kişi adı zorunludur")
  const amount = Number(debt.amount)
  if (!isFinite(amount) || amount < 0) throw new Error("Geçersiz borç tutarı")
  const payload = fromDebt({ ...debt, amount }, userId)
  const query = editId
    ? supabase.from("debts").update(payload).eq("id", editId).eq("user_id", userId)
    : supabase.from("debts").insert(payload)

  const { data, error } = await query.select().single()
  if (error) throw error
  return toDebt(data)
}

export async function settleDebt(userId, id) {
  const { data, error } = await supabase
    .from("debts")
    .update({ is_settled: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return toDebt(data)
}

export async function deleteDebt(userId, id) {
  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function addDebtPayment(userId, payment) {
  if (!userId) throw new Error("userId gerekli")
  if (!payment.debtId) throw new Error("debtId gerekli")
  const amount = Number(payment.amount)
  if (!isFinite(amount) || amount <= 0) throw new Error("Ödeme tutarı sıfırdan büyük olmalıdır")
  const { data, error } = await supabase
    .from("debt_payments")
    .insert({
      user_id: userId,
      debt_id: payment.debtId,
      amount,
      payment_date: payment.paymentDate,
      note: payment.note || null,
    })
    .select()
    .single()

  if (error) throw error
  return toDebtPayment(data)
}

function buildLocalCoachResponse(message, summary) {
  const totals = summary?.totals || { income: 0, expense: 0, net: 0 }
  const previous = summary?.previousMonthTotals || { expense: 0 }
  const topCategory = summary?.topExpenseCategories?.[0]
  const topLocation = summary?.topLocations?.[0]
  const budgetRisk = summary?.budgetStatus?.find((item) => item.remaining < 0)
    || summary?.budgetStatus?.find((item) => item.budget > 0 && item.spent / item.budget >= 0.8)
  const cardUsage = summary?.creditCards?.usageRate || 0
  const debtTotal = summary?.debts?.iOweTotal || 0
  const assetCount = summary?.assets?.count || 0

  const lines = [
    "AI Edge Function henüz deploy edilmediği için yerel analiz modundayım.",
    `Bu ay net akışınız ${Math.round(totals.net).toLocaleString("tr-TR")} TL.`,
    `Toplam gideriniz ${Math.round(totals.expense).toLocaleString("tr-TR")} TL; geçen aya göre fark ${Math.round(totals.expense - previous.expense).toLocaleString("tr-TR")} TL.`,
  ]

  if (topCategory) {
    lines.push(`En yüksek gider kategoriniz ${topCategory.name}: ${Math.round(topCategory.value).toLocaleString("tr-TR")} TL.`)
  }
  if (topLocation) {
    lines.push(`Bu ay en çok harcama yaptığınız mekan: ${topLocation.location} (${Math.round(topLocation.amount).toLocaleString("tr-TR")} TL).`)
  }
  if (budgetRisk) {
    lines.push(`${budgetRisk.name} bütçesinde dikkat gerekiyor; kalan tutar ${Math.round(budgetRisk.remaining).toLocaleString("tr-TR")} TL.`)
  }
  if (cardUsage > 0) {
    lines.push(`Kredi kartı kullanım oranınız yaklaşık %${cardUsage}; minimum ödeme toplamı ${Math.round(summary.creditCards.minPaymentEstimate || 0).toLocaleString("tr-TR")} TL görünüyor.`)
  }
  if (debtTotal > 0) {
    lines.push(`Aktif borçlarınızda kalan toplam ${Math.round(debtTotal).toLocaleString("tr-TR")} TL.`)
  }
  if (assetCount > 0) {
    lines.push(`${assetCount} varlık kaydınız koç özetine dahil edildi.`)
  }

  return {
    reply: lines.join("\n"),
    insights: [
      {
        type: "setup",
        title: "AI Koç yerel modda",
        body: "Groq destekli yanıt için Supabase Edge Function deploy edin ve GROQ_API_KEY secret ekleyin.",
        severity: "warning",
      },
      {
        type: "question",
        title: "Sorunuz kaydedildi",
        body: message,
        severity: "info",
      },
    ],
  }
}

// ─── Kredi Kartları ────────────────────────────────────────────────────────

const toCreditCard = (row) => ({
  id: row.id,
  name: row.name,
  bankName: row.bank_name,
  cardType: row.card_type,
  creditLimit: Number(row.credit_limit),
  currentDebt: Number(row.current_debt),
  statementDay: row.statement_day,
  dueDay: row.due_day,
  minPaymentRate: Number(row.min_payment_rate),
  color: row.color,
  isArchived: row.is_archived,
  createdAt: row.created_at,
})

const toCreditCardStatement = (row) => ({
  id: row.id,
  creditCardId: row.credit_card_id,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  statementDate: row.statement_date,
  dueDate: row.due_date,
  totalAmount: Number(row.total_amount || 0),
  minPaymentAmount: Number(row.min_payment_amount || 0),
  paidAmount: Number(row.paid_amount || 0),
  status: row.status || "open",
  createdAt: row.created_at,
})

const toCreditCardPayment = (row) => ({
  id: row.id,
  creditCardId: row.credit_card_id,
  statementId: row.statement_id || "",
  amount: Number(row.amount || 0),
  paymentDate: row.payment_date,
  note: row.note || "",
  createdAt: row.created_at,
})

const fromCreditCard = (card, userId) => ({
  user_id: userId,
  name: card.name,
  bank_name: card.bankName || '',
  card_type: card.cardType || 'Visa',
  credit_limit: card.creditLimit || 0,
  current_debt: card.currentDebt || 0,
  statement_day: card.statementDay || 1,
  due_day: card.dueDay || 15,
  min_payment_rate: card.minPaymentRate || 3,
  color: card.color || '#4edea3',
  is_archived: Boolean(card.isArchived),
})

export async function loadCreditCards(userId) {
  const data = await loadCreditCardData(userId)
  return data.creditCards
}

export async function loadCreditCardData(userId) {
  const [cardsResult, statementsResult, paymentsResult] = await Promise.all([
    supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from("credit_card_statements")
      .select("*")
      .eq("user_id", userId)
      .order("statement_date", { ascending: false })
      .limit(60),
    supabase
      .from("credit_card_payments")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false })
      .limit(80),
  ])

  if (cardsResult.error) {
    if (isSchemaMissing(cardsResult.error)) return { creditCards: [], statements: [], payments: [] }
    throw cardsResult.error
  }

  return {
    creditCards: (cardsResult.data || []).map(toCreditCard),
    statements: optionalRows(statementsResult).map(toCreditCardStatement),
    payments: optionalRows(paymentsResult).map(toCreditCardPayment),
  }
}

export async function loadCreditCardsLegacy(userId) {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true })
  if (error) {
    if (isSchemaMissing(error)) return []
    throw error
  }
  return (data || []).map(toCreditCard)
}

export async function saveCreditCard(userId, card, editId) {
  const payload = fromCreditCard(card, userId)
  if (editId) {
    const { data, error } = await supabase
      .from('credit_cards')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', editId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return toCreditCard(data)
  }
  const { data, error } = await supabase
    .from('credit_cards')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return toCreditCard(data)
}

export async function deleteCreditCard(userId, cardId) {
  const { error } = await supabase
    .from('credit_cards')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', cardId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function saveCreditCardPayment(userId, payment) {
  const amount = Number(payment.amount)
  if (!payment.creditCardId) throw new Error("Kart seçilmesi zorunludur.")
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Geçerli ödeme tutarı girin.")

  let statementId = payment.statementId || null
  if (!statementId && payment.statementDraft) {
    const draft = payment.statementDraft
    const totalAmount = Number(draft.totalAmount || 0)
    const { data: statement, error: statementError } = await supabase
      .from("credit_card_statements")
      .upsert({
        user_id: userId,
        credit_card_id: payment.creditCardId,
        period_start: draft.periodStart,
        period_end: draft.periodEnd,
        statement_date: draft.statementDate,
        due_date: draft.dueDate,
        total_amount: totalAmount,
        min_payment_amount: Number(draft.minPaymentAmount || 0),
        status: "open",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,credit_card_id,statement_date" })
      .select()
      .single()

    if (statementError) {
      if (isSchemaMissing(statementError)) throw new Error("Kredi kartı ekstre tablosu hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın.")
      throw statementError
    }
    statementId = statement?.id || null
  }

  const { data, error } = await supabase
    .from("credit_card_payments")
    .insert({
      user_id: userId,
      credit_card_id: payment.creditCardId,
      statement_id: statementId,
      amount,
      payment_date: payment.paymentDate || new Date().toISOString().slice(0, 10),
      note: payment.note || null,
    })
    .select()
    .single()

  if (error) {
    if (isSchemaMissing(error)) throw new Error("Kredi kartı ödeme tablosu hazır değil. Supabase SQL Editor'da supabase/schema.sql dosyasını çalıştırın.")
    throw error
  }

  const { data: card } = await supabase
    .from("credit_cards")
    .select("current_debt")
    .eq("id", payment.creditCardId)
    .eq("user_id", userId)
    .maybeSingle()

  if (card) {
    await supabase
      .from("credit_cards")
      .update({ current_debt: Math.max(Number(card.current_debt || 0) - amount, 0), updated_at: new Date().toISOString() })
      .eq("id", payment.creditCardId)
      .eq("user_id", userId)
  }

  if (statementId) {
    const { data: statement } = await supabase
      .from("credit_card_statements")
      .select("total_amount,paid_amount")
      .eq("id", statementId)
      .eq("user_id", userId)
      .maybeSingle()
    if (statement) {
      const paidAmount = Number(statement.paid_amount || 0) + amount
      const totalAmount = Number(statement.total_amount || 0)
      await supabase
        .from("credit_card_statements")
        .update({
          paid_amount: paidAmount,
          status: paidAmount >= totalAmount ? "paid" : "partial",
          updated_at: new Date().toISOString(),
        })
        .eq("id", statementId)
        .eq("user_id", userId)
    }
  }

  return toCreditCardPayment(data)
}
