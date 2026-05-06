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

export const buildCoachSummary = ({
  txs,
  cats,
  goals,
  recurringRules,
  profile,
  debts = [],
  debtPayments = [],
  assets = [],
  creditCards = [],
}) => {
  const thisMonth = currentMonthKey()
  const lastMonth = previousMonthKey()
  const thisMonthTxs = transactionsForMonth(txs, thisMonth)
  const lastMonthTxs = transactionsForMonth(txs, lastMonth)
  const topExpenseCategories = categoryTotals(thisMonthTxs, cats, "expense").slice(0, 6)
  const previousExpenseCategories = categoryTotals(lastMonthTxs, cats, "expense")
  const activeGoals = goals.filter((goal) => !goal.isArchived)
  const activeRules = recurringRules.filter((rule) => rule.isActive)
  const activeDebts = debts.filter((debt) => !debt.isSettled)
  const activeCards = creditCards.filter((card) => !card.isArchived)

  return {
    month: thisMonth,
    profile: {
      displayName: profile?.display_name || profile?.displayName || "",
      currency: profile?.currency || "TRY",
      monthlyIncomeTarget: Number(profile?.monthly_income_target || profile?.monthlyIncomeTarget || 0),
      locale: profile?.locale || "tr-TR",
      timezone: profile?.timezone || "",
    },
    totals: totalsFor(thisMonthTxs),
    previousMonthTotals: totalsFor(lastMonthTxs),
    topExpenseCategories,
    topIncomeCategories: categoryTotals(thisMonthTxs, cats, "income").slice(0, 4),
    categoryTrends: topExpenseCategories.map((item) => {
      const previous = previousExpenseCategories.find((prev) => prev.catId === item.catId)?.value || 0
      return {
        name: item.name,
        current: item.value,
        previous,
        change: item.value - previous,
      }
    }),
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
    goals: activeGoals.map((goal) => ({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remaining: Math.max(Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0), 0),
      progressPct: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
      targetDate: goal.targetDate,
    })),
    recurringRules: activeRules.map((rule) => ({
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      frequency: rule.frequency,
      nextDate: rule.nextDate,
    })),
    recentTransactions: txs.slice(0, 18).map((tx) => ({
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      category: cats.find((cat) => cat.id === tx.cat)?.name || "Kategori yok",
      description: tx.desc || "",
      paymentMethod: tx.paymentMethod || "",
      location: tx.location || "",
      tags: Array.isArray(tx.tags) ? tx.tags.slice(0, 4) : [],
    })),
    topLocations: buildTopLocations(thisMonthTxs),
    debts: buildDebtSummary(activeDebts, debtPayments),
    assets: buildAssetSummary(assets),
    creditCards: buildCreditCardSummary(activeCards),
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

function buildDebtSummary(debts, payments) {
  const paidByDebt = new Map()
  for (const payment of payments) {
    paidByDebt.set(payment.debtId, (paidByDebt.get(payment.debtId) || 0) + Number(payment.amount || 0))
  }

  const detailed = debts.map((debt) => {
    const paid = paidByDebt.get(debt.id) || 0
    const remaining = Math.max(Number(debt.amount || 0) - paid, 0)
    return {
      personName: debt.personName,
      direction: debt.direction,
      originalAmount: debt.amount,
      paid,
      remaining,
      dueDate: debt.dueDate || "",
      description: debt.description || "",
    }
  })

  return {
    iOweTotal: detailed
      .filter((debt) => debt.direction === "i_owe")
      .reduce((total, debt) => total + debt.remaining, 0),
    owedToMeTotal: detailed
      .filter((debt) => debt.direction === "owed_to_me")
      .reduce((total, debt) => total + debt.remaining, 0),
    upcoming: detailed
      .filter((debt) => debt.remaining > 0)
      .sort((a, b) => String(a.dueDate || "9999-12-31").localeCompare(String(b.dueDate || "9999-12-31")))
      .slice(0, 6),
  }
}

function buildAssetSummary(assets) {
  const activeAssets = assets.filter((asset) => !asset.isArchived)
  const byType = activeAssets.reduce((map, asset) => {
    map[asset.assetType] = (map[asset.assetType] || 0) + 1
    return map
  }, {})
  const knownBookValue = activeAssets.reduce((total, asset) => {
    if (asset.unitCost == null) return total
    return total + Number(asset.quantity || 0) * Number(asset.unitCost || 0)
  }, 0)

  return {
    count: activeAssets.length,
    byType,
    knownBookValue,
    holdings: activeAssets.slice(0, 8).map((asset) => ({
      name: asset.name,
      type: asset.assetType,
      quantity: asset.quantity,
      unitCost: asset.unitCost,
      currencyCode: asset.currencyCode || "",
      goldUnit: asset.goldUnit || "",
    })),
  }
}

function buildCreditCardSummary(cards) {
  const totalLimit = cards.reduce((total, card) => total + Number(card.creditLimit || 0), 0)
  const totalDebt = cards.reduce((total, card) => total + Number(card.currentDebt || 0), 0)

  return {
    totalLimit,
    totalDebt,
    usageRate: totalLimit > 0 ? Math.round((totalDebt / totalLimit) * 100) : 0,
    minPaymentEstimate: cards.reduce(
      (total, card) => total + (Number(card.currentDebt || 0) * Number(card.minPaymentRate || 0)) / 100,
      0
    ),
    cards: cards.slice(0, 6).map((card) => ({
      name: card.name,
      bankName: card.bankName || "",
      creditLimit: card.creditLimit,
      currentDebt: card.currentDebt,
      usageRate: card.creditLimit > 0 ? Math.round((card.currentDebt / card.creditLimit) * 100) : 0,
      dueDay: card.dueDay,
      statementDay: card.statementDay,
      minPaymentRate: card.minPaymentRate,
    })),
  }
}
