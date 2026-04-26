import { S, FONT_BODY, btnGhost, btnPrimary } from "../../constants/theme"

export default function Modal({ title, onClose, onSave, children }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,9,13,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(18px)",
        padding: 18,
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "1.5rem",
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
          <span style={{ fontWeight: 700, fontSize: 16, color: S.text }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${S.border}`,
              borderRadius: 8,
              color: S.muted,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {children}
        </div>
        <div
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
    </div>
  )
}
