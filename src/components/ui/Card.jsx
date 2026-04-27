export default function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={`glass-card${className ? ` ${className}` : ""}`}
      style={{
        padding: "1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
