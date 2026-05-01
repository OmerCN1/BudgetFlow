export const TRY = (n) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(n)

export const sum = (arr) => arr.reduce((s, t) => s + Number(t?.amount || 0), 0)

export const today = () => new Date().toISOString().slice(0, 10)

export const uid = () =>
  `id${Date.now()}${Math.random().toString(36).slice(2, 5)}`
