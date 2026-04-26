export default function Card({ children, style = {} }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
