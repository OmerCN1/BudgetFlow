export const S = {
  bg: "#05090d",
  surface: "#0e1511",
  surfaceDim: "#0e1511",
  surfaceBright: "#343b36",
  containerLowest: "#09100c",
  containerLow: "#161d19",
  container: "#1a211d",
  containerHigh: "#242c27",
  containerHighest: "#2f3632",
  card: "rgba(255,255,255,0.055)",
  card2: "rgba(78,222,163,0.08)",
  border: "rgba(187,202,191,0.18)",
  borderStrong: "rgba(187,202,191,0.34)",
  text: "#dde4dd",
  sub: "#bbcabf",
  muted: "#86948a",
  green: "#4edea3",
  cyan: "#4cd7f6",
  red: "#f43f5e",
  rose: "#ffb3af",
  amber: "#f59e0b",
  tint: "#4edea3",
}

export const S_LIGHT = {
  bg: "#f0f4f1",
  surface: "#e6ede8",
  surfaceDim: "#dce5de",
  surfaceBright: "#ffffff",
  containerLowest: "#f8faf8",
  containerLow: "#eef3ef",
  container: "#e6ede8",
  containerHigh: "#dce5de",
  containerHighest: "#cfd9d1",
  card: "rgba(255,255,255,0.72)",
  card2: "rgba(16,185,129,0.08)",
  border: "rgba(60,100,75,0.14)",
  borderStrong: "rgba(60,100,75,0.28)",
  text: "#0d1f15",
  sub: "#2d4a38",
  muted: "#5a7a65",
  green: "#0d9e6e",
  cyan: "#0891b2",
  red: "#dc2626",
  rose: "#e11d48",
  amber: "#d97706",
  tint: "#0d9e6e",
}

export function getS(theme) {
  return theme === "light" ? S_LIGHT : S
}

export const PALETTE = [
  "#4edea3",
  "#4cd7f6",
  "#ffb3af",
  "#f59e0b",
  "#10b981",
  "#03b5d3",
  "#fc7c78",
  "#acedff",
  "#6ffbbe",
  "#bbcabf",
]

export const FONT_BODY = "'Plus Jakarta Sans', sans-serif"
export const FONT_MONO = "'JetBrains Mono', monospace"

export const inputStyle = {
  width: "100%",
  background: "rgba(9,16,12,0.72)",
  border: `1px solid ${S.border}`,
  borderRadius: 8,
  padding: "11px 12px",
  color: S.text,
  fontSize: 13,
  fontFamily: FONT_BODY,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
}

export const btnPrimary = {
  background: `linear-gradient(135deg, ${S.green}, #10b981 58%, ${S.cyan})`,
  color: "#002113",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
  fontFamily: FONT_BODY,
  boxShadow: "0 0 0 1px rgba(111,251,190,0.16), 0 14px 38px rgba(16,185,129,0.22)",
}

export const btnGhost = {
  background: "rgba(255,255,255,0.035)",
  color: S.text,
  border: `1px solid ${S.border}`,
  borderRadius: 8,
  padding: "10px 18px",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: FONT_BODY,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
}

export const btnDanger = {
  background: "rgba(244,63,94,0.08)",
  color: S.red,
  border: "1px solid rgba(244,63,94,0.26)",
  borderRadius: 8,
  padding: "6px 11px",
  cursor: "pointer",
  fontSize: 11,
  fontFamily: FONT_BODY,
}
