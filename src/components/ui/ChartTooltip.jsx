import { S, FONT_BODY, FONT_MONO } from "../../constants/theme"
import { TRY } from "../../utils/helpers"

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: "rgba(14,21,17,0.9)",
        border: `1px solid ${S.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 18px 54px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ color: S.sub, marginBottom: 5, fontFamily: FONT_BODY }}>
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
