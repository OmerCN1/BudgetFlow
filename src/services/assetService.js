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

function isSchemaMissing(err) {
  return err?.code === "42P01" || err?.message?.includes("relation") || err?.message?.includes("schema cache")
}

export async function loadAssets(userId) {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  if (error) {
    if (isSchemaMissing(error)) return []
    throw error
  }
  return (data || []).map(toAsset)
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
