import { supabase } from "../lib/supabase"

const toAsset = (row) => ({
  id: row.id,
  name: row.name,
  assetType: row.asset_type,
  goldUnit: row.gold_unit || null,
  currencyCode: row.currency_code || null,
  quantity: Number(row.quantity || 0),
  unitCost: row.unit_cost != null ? Number(row.unit_cost) : null,
  note: row.note || "",
  isArchived: Boolean(row.is_archived),
  createdAt: row.created_at,
})

const toAssetTransaction = (row) => ({
  id: row.id,
  assetId: row.asset_id,
  transactionType: row.transaction_type,
  quantity: Number(row.quantity || 0),
  unitPrice: Number(row.unit_price || 0),
  totalAmount: Number(row.total_amount || 0),
  fee: Number(row.fee || 0),
  transactionDate: row.transaction_date,
  note: row.note || "",
  createdAt: row.created_at,
})

const toAssetSnapshot = (row) => ({
  id: row.id,
  assetId: row.asset_id,
  snapshotDate: row.snapshot_date,
  assetType: row.asset_type,
  priceTRY: row.price_try != null ? Number(row.price_try) : null,
  quantity: Number(row.quantity || 0),
  totalValueTRY: Number(row.total_value_try || 0),
  source: row.source || "client-market",
  createdAt: row.created_at,
})

const fromAsset = (asset, userId) => ({
  user_id: userId,
  name: asset.name,
  asset_type: asset.assetType,
  gold_unit: asset.goldUnit || null,
  currency_code: asset.currencyCode || null,
  quantity: asset.quantity || 0,
  unit_cost: asset.unitCost != null ? asset.unitCost : null,
  note: asset.note || null,
  is_archived: Boolean(asset.isArchived),
})

const fromAssetTransaction = (transaction, userId) => {
  const quantity = Number(transaction.quantity)
  const unitPrice = Number(transaction.unitPrice || 0)
  const fee = Number(transaction.fee || 0)
  const totalAmount = transaction.totalAmount != null
    ? Number(transaction.totalAmount)
    : Math.max(quantity * unitPrice + fee, 0)

  return {
    user_id: userId,
    asset_id: transaction.assetId,
    transaction_type: transaction.transactionType,
    quantity,
    unit_price: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
    total_amount: Number.isFinite(totalAmount) && totalAmount >= 0 ? totalAmount : 0,
    fee: Number.isFinite(fee) && fee >= 0 ? fee : 0,
    transaction_date: transaction.transactionDate || new Date().toISOString().slice(0, 10),
    note: transaction.note || null,
  }
}

function isSchemaMissing(err) {
  return (
    err?.code === "42P01" ||
    err?.code === "42703" ||
    err?.code === "PGRST204" ||
    err?.message?.includes("relation") ||
    err?.message?.includes("schema cache")
  )
}

function optionalRows(result) {
  if (!result.error) return result.data || []
  if (isSchemaMissing(result.error)) return []
  throw result.error
}

export async function loadAssetPortfolio(userId) {
  const [assetsResult, transactionsResult, snapshotsResult] = await Promise.all([
    supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("asset_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("asset_price_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: true }),
  ])

  if (assetsResult.error) {
    if (isSchemaMissing(assetsResult.error)) return { assets: [], transactions: [], snapshots: [] }
    throw assetsResult.error
  }

  return {
    assets: (assetsResult.data || []).map(toAsset),
    transactions: optionalRows(transactionsResult).map(toAssetTransaction),
    snapshots: optionalRows(snapshotsResult).map(toAssetSnapshot),
  }
}

export async function loadAssets(userId) {
  const portfolio = await loadAssetPortfolio(userId)
  return portfolio.assets
}

export async function saveAsset(userId, asset, editId) {
  const payload = fromAsset(asset, userId)
  const query = editId
    ? supabase.from("assets").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId).eq("user_id", userId)
    : supabase.from("assets").insert(payload)

  const { data, error } = await query.select().single()
  if (error) throw error
  return toAsset(data)
}

export async function deleteAsset(userId, id) {
  const { error } = await supabase
    .from("assets")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
  if (error) throw error
}

export async function saveAssetTransaction(userId, transaction) {
  if (!transaction.assetId) throw new Error("Varlık seçilmesi zorunludur.")
  if (!["buy", "sell", "deposit", "withdraw"].includes(transaction.transactionType)) {
    throw new Error("Geçersiz varlık hareketi.")
  }

  const quantity = Number(transaction.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Geçerli bir miktar girin.")

  const { data: assetRow, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", transaction.assetId)
    .eq("user_id", userId)
    .single()
  if (assetError) throw assetError

  const direction = ["buy", "deposit"].includes(transaction.transactionType) ? 1 : -1
  const nextQuantity = Number(assetRow.quantity || 0) + direction * quantity
  if (nextQuantity < -0.000001) throw new Error("Bu hareket varlık miktarını sıfırın altına düşürüyor.")

  const payload = fromAssetTransaction({ ...transaction, quantity }, userId)
  const { data, error } = await supabase
    .from("asset_transactions")
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  const { data: updatedAsset, error: updateError } = await supabase
    .from("assets")
    .update({ quantity: Math.max(nextQuantity, 0), updated_at: new Date().toISOString() })
    .eq("id", transaction.assetId)
    .eq("user_id", userId)
    .select()
    .single()

  if (updateError) throw updateError

  return {
    transaction: toAssetTransaction(data),
    asset: toAsset(updatedAsset),
  }
}

export async function recordAssetSnapshots(userId, snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return []

  const rows = snapshots
    .map((snapshot) => ({
      user_id: userId,
      asset_id: snapshot.assetId,
      snapshot_date: snapshot.snapshotDate,
      asset_type: snapshot.assetType,
      price_try: snapshot.priceTRY ?? null,
      quantity: snapshot.quantity || 0,
      total_value_try: snapshot.totalValueTRY || 0,
      source: snapshot.source || "client-market",
    }))
    .filter((snapshot) => snapshot.asset_id && snapshot.snapshot_date)

  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from("asset_price_snapshots")
    .upsert(rows, { onConflict: "user_id,asset_id,snapshot_date" })
    .select()

  if (error) {
    if (isSchemaMissing(error)) return []
    throw error
  }

  return (data || []).map(toAssetSnapshot)
}
