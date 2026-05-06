import { useEffect } from "react"
import { createPortal } from "react-dom"

import { S, FONT_BODY, btnGhost, btnPrimary } from "../../constants/theme"

export default function Modal({ title, onClose, onSave, children }) {
  useEffect(() => {
    const nextCount = Number(document.body.dataset.modalOpenCount || 0) + 1
    document.body.dataset.modalOpenCount = String(nextCount)
    document.body.classList.add("modal-open")

    return () => {
      const remainingCount = Math.max(Number(document.body.dataset.modalOpenCount || 1) - 1, 0)
      if (remainingCount === 0) {
        document.body.classList.remove("modal-open")
        delete document.body.dataset.modalOpenCount
      } else {
        document.body.dataset.modalOpenCount = String(remainingCount)
      }
    }
  }, [])

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(18px)",
        padding: 18,
      }}
    >
      <div
        className="glass-card modal-panel"
        style={{
          width: 440,
          maxWidth: "94vw",
          fontFamily: FONT_BODY,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <span className="modal-title" style={{ fontWeight: 700, fontSize: 16, color: S.text }}>
            {title}
          </span>
          <button
            className="modal-close-button"
            onClick={onClose}
            style={{
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
              width: 34,
              height: 34,
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {children}
        </div>
        <div
          className="modal-actions"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: "1.25rem",
          }}
        >
          <button onClick={onClose} style={btnGhost}>
            İptal
          </button>
          <button onClick={onSave} style={btnPrimary}>
            Kaydet
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
