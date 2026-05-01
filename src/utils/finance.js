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

export const calculateHealthScore = ({ totals, budgetRisks, cats }) => {
  let score = 82
  if (totals.income > 0) {
    const expenseRatio = totals.expense / totals.income
    if (expenseRatio > 1) score -= 24
    else if (expenseRatio > 0.85) score -= 14
    else if (expenseRatio < 0.65) score += 6
  } else if (totals.expense > 0) {
    score -= 20
  }

  budgetRisks.forEach((risk) => {
    score -= risk.pct >= 100 ? 14 : 7
  })

  const budgetedCount = cats.filter((cat) => !cat.isIncome && !cat.isArchived && cat.budget > 0).length
  if (budgetedCount >= 3) score += 5
  if (totals.net > 0) score += 7

  return Math.max(0, Math.min(100, Math.round(score)))
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
    topLocations: buildTopLocations(thisMonthTxs),
  }
}

function buildTopLocations(txs) {
  const totals = new Map()
  for (const tx of txs) {
    if (!tx.location || tx.type !== "expense") continue
    const key = tx.location.trim()
    totals.set(key, (totals.get(key) || 0) + tx.amount)
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, amount]) => ({ location, amount }))
}

