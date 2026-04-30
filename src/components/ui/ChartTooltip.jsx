import { FONT_BODY, FONT_MONO } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: "var(--bf-tooltip-bg)",
        border: "1px solid var(--bf-tooltip-border)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        color: "var(--bf-tooltip-text)",
        boxShadow: "var(--bf-tooltip-shadow)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ color: "var(--bf-tooltip-label)", marginBottom: 5, fontFamily: FONT_BODY }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            color: p.color,
            fontFamily: FONT_MONO,
            fontWeight: 600,
          }}
        >
          {p.name}: {TRY(p.value)}
        </div>
      ))}
    </div>
  )
}
