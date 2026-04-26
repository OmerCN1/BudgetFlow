import { sum } from "./helpers"

export const monthKey = (date) => date.slice(0, 7)

export const currentMonthKey = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export const previousMonthKey = () => {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export const monthLabel = (key) => {
  const [year, month] = key.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString("tr-TR", {
    month: "short",
    year: "2-digit",
  })
}

export const transactionsForMonth = (txs, key) =>
  txs.filter((tx) => tx.date?.startsWith(key))

export const totalsFor = (txs) => {
  const income = sum(txs.filter((tx) => tx.type === "income"))
  const expense = sum(txs.filter((tx) => tx.type === "expense"))
  return { income, expense, net: income - expense }
}

export const categoryTotals = (txs, cats, type = "expense") => {
  const map = {}
  txs
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      map[tx.cat] = (map[tx.cat] || 0) + tx.amount
    })

  return Object.entries(map)
    .map(([catId, value]) => {
      const category = cats.find((cat) => cat.id === catId)
      return {
        catId,
        name: category?.name || "Kategori yok",
        color: category?.color || "#94a3b8",
        value,
      }
    })
    .sort((a, b) => b.value - a.value)
}

export const buildCoachSummary = ({ txs, cats, goals, recurringRules }) => {
  const thisMonth = currentMonthKey()
  const lastMonth = previousMonthKey()
  const thisMonthTxs = transactionsForMonth(txs, thisMonth)
  const lastMonthTxs = transactionsForMonth(txs, lastMonth)
  return {
    month: thisMonth,
    totals: totalsFor(thisMonthTxs),
    previousMonthTotals: totalsFor(lastMonthTxs),
    topExpenseCategories: categoryTotals(thisMonthTxs, cats, "expense").slice(0, 6),
    budgetStatus: cats
      .filter((cat) => !cat.isIncome && cat.budget > 0 && !cat.isArchived)
      .map((cat) => {
        const spent = thisMonthTxs
          .filter((tx) => tx.type === "expense" && tx.cat === cat.id)
          .reduce((total, tx) => total + tx.amount, 0)
        return {
          name: cat.name,
          budget: cat.budget,
          spent,
          remaining: cat.budget - spent,
        }
      }),
    goals: goals.filter((goal) => !goal.isArchived).map((goal) => ({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
    })),
    recurringRules: recurringRules.filter((rule) => rule.isActive).map((rule) => ({
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      nextDate: rule.nextDate,
    })),
  }
}

