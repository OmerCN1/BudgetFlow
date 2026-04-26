import { useMemo, useRef, useState } from "react"
import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import Modal from "../ui/Modal"
import { S, FONT_BODY, FONT_MONO, inputStyle, btnGhost, btnDanger, btnPrimary, PALETTE } from "../../constants/theme"
import { TRY, sum } from "../../utils/helpers"

export default function Transactions({
  txs,
  cats,
  catById,
  showModal,
  editTx,
  txForm,
  setTxForm,
  filters,
  setFilters,
  onAdd,
  onEdit,
  onSave,
  onDelete,
  onBulkDelete,
  onBulkUpdate,
  onClose,
  exportCSV,
  importCSV,
}) {
  const fileInputRef = useRef(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [sort, setSort] = useState({ key: "date", dir: "desc" })
  const [bulkPatch, setBulkPatch] = useState({ type: "", cat: "", paymentMethod: "" })
  const availCats = useMemo(
    () =>
      txForm.type === "income"
        ? cats.filter((c) => c.isIncome)
        : cats.filter((c) => !c.isIncome),
    [txForm.type, cats]
  )

  const filteredTxs = useMemo(
    () =>
      [...txs]
        .filter((t) => {
          if (filters.type && t.type !== filters.type) return false
          if (filters.cat  && t.cat  !== filters.cat)  return false
          if (filters.from && t.date < filters.from)   return false
          if (filters.to   && t.date > filters.to)     return false
          if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false
          if (filters.q) {
            const c = catById(t.cat)
            const haystack = `${t.desc || ""} ${c?.name || ""} ${(t.tags || []).join(" ")}`.toLowerCase()
            if (!haystack.includes(filters.q.toLowerCase())) return false
          }
          return true
        })
        .sort((a, b) => compareTransactions(a, b, sort, catById)),
    [txs, filters, catById, sort]
  )

  const hasFilters = filters.type || filters.cat || filters.from || filters.to || filters.q || filters.paymentMethod
  const clearFilters = () => setFilters({ type: "", cat: "", from: "", to: "", q: "", paymentMethod: "" })
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected = filteredTxs.length > 0 && filteredTxs.every((tx) => selectedSet.has(tx.id))
  const bulkCats = bulkPatch.type
    ? cats.filter((cat) => bulkPatch.type === "income" ? cat.isIncome : !cat.isIncome)
    : cats

  const toggleSort = (key) => {
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }))
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const applyBulkUpdate = async () => {
    const patch = Object.fromEntries(Object.entries(bulkPatch).filter(([, value]) => value))
    await onBulkUpdate(selectedIds, patch)
    setBulkPatch({ type: "", cat: "", paymentMethod: "" })
    setSelectedIds([])
  }

  return (
    <div>
      <Card style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 10,
          }}
        >
          {[
            {
              label: "Arama",
              el: (
                <input
                  value={filters.q || ""}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, q: e.target.value }))
                  }
                  placeholder="Açıklama, kategori, etiket..."
                  style={inputStyle}
                />
              ),
            },
            {
              label: "Tür",
              el: (
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, type: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="">Tümü</option>
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              ),
            },
            {
              label: "Kategori",
              el: (
                <select
                  value={filters.cat}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, cat: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="">Tümü</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              label: "Ödeme",
              el: (
                <select
                  value={filters.paymentMethod || ""}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, paymentMethod: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="">Tümü</option>
                  <option value="Kart">Kart</option>
                  <option value="Nakit">Nakit</option>
                  <option value="Banka">Banka</option>
                  <option value="Dijital">Dijital</option>
                </select>
              ),
            },
            {
              label: "Başlangıç Tarihi",
              el: (
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, from: e.target.value }))
                  }
                  style={inputStyle}
                />
              ),
            },
            {
              label: "Bitiş Tarihi",
              el: (
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, to: e.target.value }))
                  }
                  style={inputStyle}
                />
              ),
            },
          ].map(({ label, el }, i) => (
            <div key={i}>
              <FieldLabel>{label}</FieldLabel>
              {el}
            </div>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: "transparent",
              border: "none",
              color: S.muted,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: FONT_BODY,
              marginTop: 8,
            }}
          >
            ✕ Filtreleri temizle
          </button>
        )}
      </Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12, color: S.muted, fontFamily: FONT_BODY }}>
          {filteredTxs.length} işlem ·{" "}
          <span style={{ color: S.green }}>
            {TRY(sum(filteredTxs.filter((t) => t.type === "income")))} gelir
          </span>{" "}
          ·{" "}
          <span style={{ color: S.red }}>
            {TRY(sum(filteredTxs.filter((t) => t.type === "expense")))} gider
          </span>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const text = await file.text()
              await importCSV(text)
              event.target.value = ""
            }}
            style={{ display: "none" }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={btnGhost}>
            CSV İçe Aktar
          </button>
          <button onClick={exportCSV} style={btnGhost}>
            CSV İndir
          </button>
          <button onClick={onAdd} style={btnPrimary}>
            + İşlem Ekle
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <Card style={{ marginBottom: 10, padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 140px 1fr 140px auto auto", gap: 8, alignItems: "center" }}>
            <strong style={{ color: S.green, fontSize: 13 }}>{selectedIds.length} seçili</strong>
            <select value={bulkPatch.type} onChange={(e) => setBulkPatch((p) => ({ ...p, type: e.target.value, cat: "" }))} style={inputStyle}>
              <option value="">Tür değiştir</option>
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </select>
            <select value={bulkPatch.cat} onChange={(e) => setBulkPatch((p) => ({ ...p, cat: e.target.value }))} style={inputStyle}>
              <option value="">Kategori değiştir</option>
              {bulkCats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select value={bulkPatch.paymentMethod} onChange={(e) => setBulkPatch((p) => ({ ...p, paymentMethod: e.target.value }))} style={inputStyle}>
              <option value="">Ödeme</option>
              <option value="Kart">Kart</option>
              <option value="Nakit">Nakit</option>
              <option value="Banka">Banka</option>
              <option value="Dijital">Dijital</option>
            </select>
            <button onClick={applyBulkUpdate} style={btnGhost}>Uygula</button>
            <button onClick={async () => { await onBulkDelete(selectedIds); setSelectedIds([]) }} style={btnDanger}>Toplu Sil</button>
          </div>
        </Card>
      )}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${S.border}` }}>
              {["", "Tarih", "Açıklama", "Kategori", "Ödeme", "Tür", "Tutar", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "11px 14px",
                      textAlign: i >= 5 ? "right" : "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: S.muted,
                      letterSpacing: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {i === 0 ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={() => setSelectedIds(allVisibleSelected ? [] : filteredTxs.map((tx) => tx.id))}
                      />
                    ) : ["Tarih", "Kategori", "Tutar"].includes(h) ? (
                      <button onClick={() => toggleSort(h === "Tarih" ? "date" : h === "Kategori" ? "cat" : "amount")} style={{ background: "transparent", border: 0, color: S.muted, cursor: "pointer", font: "inherit", textTransform: "uppercase" }}>
                        {h} {sort.key === (h === "Tarih" ? "date" : h === "Kategori" ? "cat" : "amount") ? (sort.dir === "asc" ? "↑" : "↓") : ""}
                      </button>
                    ) : h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map((t, idx) => {
              const c = catById(t.cat)
              return (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: `1px solid ${S.border}25`,
                    background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.025)",
                  }}
                >
                  <td style={{ padding: "11px 14px" }}>
                    <input type="checkbox" checked={selectedSet.has(t.id)} onChange={() => toggleSelect(t.id)} />
                  </td>
                  <td
                    style={{
                      padding: "11px 14px",
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      color: S.muted,
                    }}
                  >
                    {t.date}
                  </td>
                  <td
                    style={{
                      padding: "11px 14px",
                      color: S.text,
                      fontWeight: 500,
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.desc || "—"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: c?.color + "20",
                        color: c?.color,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: c?.color,
                        }}
                      />
                      {c?.name || "—"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "11px 14px",
                      fontSize: 11,
                      color: S.sub,
                    }}
                  >
                    {t.paymentMethod || "Kart"}
                    {(t.tags || []).length > 0 && (
                      <div style={{ color: S.muted, fontSize: 10 }}>
                        {(t.tags || []).slice(0, 2).join(", ")}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "11px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.type === "income" ? S.green : S.red,
                    }}
                  >
                    {t.type === "income" ? "Gelir" : "Gider"}
                  </td>
                  <td
                    style={{
                      padding: "11px 14px",
                      textAlign: "right",
                      fontFamily: FONT_MONO,
                      fontWeight: 700,
                      color: t.type === "income" ? S.green : S.red,
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {TRY(t.amount)}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => onEdit(t)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${S.border}`,
                          borderRadius: 7,
                          padding: "4px 9px",
                          color: S.sub,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: FONT_BODY,
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        style={btnDanger}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredTxs.length === 0 && (
          <EmptyState
            icon="⇄"
            title="İşlem bulunamadı"
            text={hasFilters ? "Seçili filtrelerle eşleşen işlem yok. Filtreleri temizleyerek tüm akışı görebilirsiniz." : "İlk gelir veya gider kaydınızı ekleyerek finansal akışı başlatın."}
            actionLabel={hasFilters ? "Filtreleri Temizle" : "İşlem Ekle"}
            onAction={hasFilters ? clearFilters : onAdd}
            framed={false}
          />
        )}
      </Card>
      {showModal && (
        <Modal
          title={editTx ? "İşlemi Düzenle" : "Yeni İşlem Ekle"}
          onClose={onClose}
          onSave={onSave}
        >
          <div>
            <FieldLabel>Tür</FieldLabel>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
            >
              {[
                { v: "expense", l: "💸 Gider", c: S.red },
                { v: "income",  l: "💰 Gelir", c: S.green },
              ].map(({ v, l, c }) => (
                <button
                  key={v}
                  onClick={() => setTxForm((p) => ({ ...p, type: v, cat: "" }))}
                  style={{
                    padding: "10px",
                    borderRadius: 9,
                    border: `1px solid ${txForm.type === v ? c : S.border}`,
                    background:
                      txForm.type === v ? c + "1a" : "transparent",
                    color: txForm.type === v ? c : S.muted,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: FONT_BODY,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Tutar (₺)</FieldLabel>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={txForm.amount}
              onChange={(e) =>
                setTxForm((p) => ({ ...p, amount: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel>Kategori</FieldLabel>
            <select
              value={txForm.cat}
              onChange={(e) =>
                setTxForm((p) => ({ ...p, cat: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="">Kategori seç...</option>
              {availCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Ödeme Yöntemi</FieldLabel>
            <select
              value={txForm.paymentMethod || "Kart"}
              onChange={(e) =>
                setTxForm((p) => ({ ...p, paymentMethod: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="Kart">Kart</option>
              <option value="Nakit">Nakit</option>
              <option value="Banka">Banka</option>
              <option value="Dijital">Dijital</option>
            </select>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <FieldLabel>Tarih</FieldLabel>
              <input
                type="date"
                value={txForm.date}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, date: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Açıklama</FieldLabel>
              <input
                type="text"
                placeholder="İsteğe bağlı..."
                value={txForm.desc}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, desc: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Etiketler</FieldLabel>
            <input
              type="text"
              placeholder="virgülle ayırın: market, zorunlu..."
              value={txForm.tags || ""}
              onChange={(e) =>
                setTxForm((p) => ({ ...p, tags: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

function compareTransactions(a, b, sort, catById) {
  let left
  let right
  if (sort.key === "amount") {
    left = a.amount
    right = b.amount
  } else if (sort.key === "cat") {
    left = catById(a.cat)?.name || ""
    right = catById(b.cat)?.name || ""
  } else {
    left = a.date
    right = b.date
  }

  const result = typeof left === "number"
    ? left - right
    : String(left).localeCompare(String(right), "tr-TR")
  return sort.dir === "asc" ? result : -result
}
