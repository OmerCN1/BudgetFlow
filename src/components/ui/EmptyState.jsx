import { S, btnPrimary } from "../../constants/theme"

export default function EmptyState({ title, text, actionLabel, onAction, icon = "✦", framed = true }) {
  return (
    <div
      className={framed ? "glass-card" : ""}
      style={{
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        display: "grid",
        justifyItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          color: S.green,
          background: "rgba(78,222,163,0.12)",
          border: `1px solid ${S.border}`,
          fontSize: 24,
        }}
      >
        {icon}
      </div>
      <div style={{ color: S.text, fontWeight: 800, fontSize: 18 }}>{title}</div>
      <div style={{ color: S.sub, fontSize: 13, maxWidth: 440, lineHeight: 1.6 }}>{text}</div>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ ...btnPrimary, marginTop: 6 }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
