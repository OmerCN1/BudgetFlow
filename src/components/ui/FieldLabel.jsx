import { S } from "../../constants/theme"

export default function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0,
        textTransform: "uppercase",
        color: S.sub,
        marginBottom: 10,
        marginTop: 30,
      }}
    >
      {children}
    </div>
  )
}
