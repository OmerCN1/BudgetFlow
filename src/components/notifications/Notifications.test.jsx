import { buildNotifications } from "../../utils/notifications"
import { currentMonthKey } from "../../utils/finance"

const monthDate = (day) => `${currentMonthKey()}-${String(day).padStart(2, "0")}`

describe("buildNotifications", () => {
  it("flags negative cash flow", () => {
    const items = buildNotifications({
      txs: [
        { id: "income", type: "income", amount: 1000, date: monthDate(1) },
        { id: "expense", type: "expense", amount: 1300, date: monthDate(2) },
      ],
      cats: [],
      goals: [],
      recurringRules: [],
    })

    expect(items.some((item) => item.id === "negative-net" && item.severity === "danger")).toBe(true)
  })

  it("flags categories over the budget threshold", () => {
    const items = buildNotifications({
      txs: [
        { id: "tx-1", type: "expense", amount: 850, date: monthDate(3), cat: "cat-food" },
      ],
      cats: [
        { id: "cat-food", name: "Market", isIncome: false, isArchived: false, budget: 1000 },
      ],
      goals: [],
      recurringRules: [],
    })

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "budget-cat-food",
          severity: "warning",
        }),
      ])
    )
  })

  it("ignores archived goals and categories", () => {
    const items = buildNotifications({
      txs: [
        { id: "tx-1", type: "expense", amount: 1000, date: monthDate(4), cat: "archived-cat" },
      ],
      cats: [
        { id: "archived-cat", name: "Eski", isIncome: false, isArchived: true, budget: 100 },
      ],
      goals: [
        { id: "goal-1", name: "Eski hedef", isArchived: true, targetAmount: 1000, currentAmount: 950 },
      ],
      recurringRules: [],
    })

    expect(items.some((item) => item.id === "budget-archived-cat")).toBe(false)
    expect(items.some((item) => item.id === "goal-goal-1")).toBe(false)
  })
})
