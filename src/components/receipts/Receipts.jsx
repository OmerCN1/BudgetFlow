import { useEffect, useMemo, useRef, useState } from "react"

import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import { S, btnDanger, btnGhost, btnPrimary } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function Receipts({
  receipts = [],
  txs = [],
  onUpload,
  onOpen,
  onUse,
  onDelete,
  onGetUrl,
}) {
  const fileInputRef = useRef(null)
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState("all")
  const [urls, setUrls] = useState({})
  const [preview, setPreview] = useState(null)

  const txById = useMemo(() => new Map(txs.map((tx) => [tx.id, tx])), [txs])
  const filteredReceipts = useMemo(
    () =>
      receipts.filter((receipt) => {
        if (mode === "linked" && !receipt.transactionId) return false
        if (mode === "unlinked" && receipt.transactionId) return false
        if (!query.trim()) return true
        const linkedTx = txById.get(receipt.transactionId)
        const haystack = `${receipt.merchant || ""} ${receipt.fileName || ""} ${receipt.notes || ""} ${linkedTx?.desc || ""}`.toLocaleLowerCase("tr-TR")
        return haystack.includes(query.toLocaleLowerCase("tr-TR"))
      }),
    [receipts, mode, query, txById]
  )

  useEffect(() => {
    let cancelled = false
    const imageReceipts = receipts.filter((receipt) => isImageReceipt(receipt) && !urls[receipt.id]).slice(0, 24)

    imageReceipts.forEach(async (receipt) => {
      try {
        const url = await onGetUrl?.(receipt)
        if (!cancelled && url) {
          setUrls((prev) => ({ ...prev, [receipt.id]: url }))
        }
      } catch {
        // Thumbnail failures still allow opening through the normal action.
      }
    })

    return () => {
      cancelled = true
    }
  }, [receipts, urls, onGetUrl])

  const openPreview = async (receipt) => {
    if (!isImageReceipt(receipt)) {
      onOpen?.(receipt)
      return
    }

    let url = urls[receipt.id]
    if (!url) {
      url = await onGetUrl?.(receipt)
      if (url) setUrls((prev) => ({ ...prev, [receipt.id]: url }))
    }
    if (url) setPreview({ receipt, url })
  }

  const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
  const linkedCount = receipts.filter((receipt) => receipt.transactionId).length
  const unlinkedCount = receipts.length - linkedCount

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <span className="page-kicker">Belgeler</span>
          <h1 className="page-title">Fiş ve Fatura Arşivi</h1>
          <p className="page-subtitle">{receipts.length} dosya saklanıyor · {unlinkedCount} dosya işleme bağlanmadı</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => fileInputRef.current?.click()} style={btnPrimary}>+ Belge Yükle</button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          await onUpload?.(file)
          event.target.value = ""
        }}
        style={{ display: "none" }}
      />
      <Card>
        <div className="receipts-stat-grid">
          {[
            { label: "Toplam Belge", value: receipts.length, color: S.cyan },
            { label: "Bağlı Belge", value: linkedCount, color: S.green },
            { label: "Bekleyen", value: unlinkedCount, color: unlinkedCount > 0 ? S.amber : S.green },
            { label: "Okunan Tutar", value: TRY(totalAmount), color: S.sub },
          ].map((item) => (
            <div key={item.label} className="receipts-stat">
              <span>{item.label}</span>
              <strong style={{ color: item.color }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="receipts-toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Satıcı, dosya adı veya işlem ara..."
          />
          <div>
            {[
              { id: "all", label: "Tümü" },
              { id: "unlinked", label: "Bekleyen" },
              { id: "linked", label: "Bağlı" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={mode === item.id ? "is-active" : ""}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filteredReceipts.length === 0 ? (
        <Card>
          <EmptyState
            icon="▣"
            title="Belge bulunamadı"
            text={receipts.length === 0 ? "Fiş veya fatura yükleyerek arşivinizi başlatın." : "Arama veya filtreyle eşleşen belge yok."}
            actionLabel="Belge Yükle"
            onAction={() => fileInputRef.current?.click()}
            framed={false}
          />
        </Card>
      ) : (
        <div className="receipts-gallery">
          {filteredReceipts.map((receipt) => {
            const linkedTx = txById.get(receipt.transactionId)
            const imageUrl = urls[receipt.id]
            return (
              <Card key={receipt.id} className="receipt-gallery-card">
                <button type="button" className="receipt-preview" onClick={() => openPreview(receipt)}>
                  {isImageReceipt(receipt) && imageUrl ? (
                    <img src={imageUrl} alt={receipt.merchant || receipt.fileName} />
                  ) : (
                    <span>{receipt.fileType?.includes("pdf") ? "PDF" : "IMG"}</span>
                  )}
                </button>
                <div className="receipt-gallery-copy">
                  <strong>{receipt.merchant || receipt.fileName}</strong>
                  <span>{receipt.date || "Tarih yok"} · {receipt.amount ? TRY(receipt.amount) : "Tutar yok"}</span>
                  <small>{linkedTx ? `Bağlı işlem: ${linkedTx.desc || linkedTx.date}` : "Henüz işleme bağlanmadı"}</small>
                </div>
                <div className="receipt-gallery-actions">
                  <button type="button" onClick={() => openPreview(receipt)} style={btnGhost}>Görüntüle</button>
                  {!linkedTx && <button type="button" onClick={() => onUse?.(receipt)} style={btnGhost}>İşleştir</button>}
                  <button type="button" onClick={() => onDelete?.(receipt)} style={btnDanger}>Sil</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {preview && (
        <div className="receipt-lightbox" role="dialog" aria-modal="true" aria-label="Fiş önizleme">
          <div className="receipt-lightbox-panel">
            <div className="receipt-lightbox-head">
              <div>
                <strong>{preview.receipt.merchant || preview.receipt.fileName}</strong>
                <span>{preview.receipt.date || "Tarih yok"} · {preview.receipt.amount ? TRY(preview.receipt.amount) : "Tutar yok"}</span>
              </div>
              <button type="button" onClick={() => setPreview(null)}>Kapat</button>
            </div>
            <img src={preview.url} alt={preview.receipt.merchant || preview.receipt.fileName} />
          </div>
        </div>
      )}
    </div>
  )
}

function isImageReceipt(receipt) {
  return receipt.fileType?.startsWith("image/")
}
