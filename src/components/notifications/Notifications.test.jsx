import { buildNotifications } from "../../utils/notifications"
import { currentMonthKey } from "../../utils/finance"

const monthDate = (day) => `${currentMonthKey()}-${String(day).padStart(2, "0")}`

// Bugünden n gün sonrasının tarihini YYYY-MM-DD olarak döndürür
const futureDateStr = (daysFromNow) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

describe("buildNotifications", () => {
  // ---- Mevcut testler ----

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

  // ---- Bütçe aşımı: danger seviyesi ----

  it("bütçe %100 aşıldığında danger severity verir", () => {
    const items = buildNotifications({
      txs: [
        { id: "tx-1", type: "expense", amount: 1200, date: monthDate(5), cat: "cat-rent" },
      ],
      cats: [
        { id: "cat-rent", name: "Kira", isIncome: false, isArchived: false, budget: 1000 },
      ],
      goals: [],
      recurringRules: [],
    })
    const notification = items.find((item) => item.id === "budget-cat-rent")
    expect(notification).toBeDefined()
    expect(notification.severity).toBe("danger")
  })

  it("%80 altındaki harcamalar bildirim oluşturmaz", () => {
    const items = buildNotifications({
      txs: [
        { id: "tx-1", type: "expense", amount: 500, date: monthDate(5), cat: "cat-food" },
      ],
      cats: [
        { id: "cat-food", name: "Market", isIncome: false, isArchived: false, budget: 1000 },
      ],
      goals: [],
      recurringRules: [],
    })
    expect(items.some((item) => item.id === "budget-cat-food")).toBe(false)
  })

  // ---- Tekrarlayan işlemler ----

  it("3 gün sonraki tekrarlayan kural info severity ile gelir", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [],
      recurringRules: [
        {
          id: "sub-1",
          name: "Netflix",
          isActive: true,
          nextDate: futureDateStr(3),
          type: "expense",
          amount: 150,
        },
      ],
    })
    const notification = items.find((item) => item.id === "recurring-sub-1")
    expect(notification).toBeDefined()
    expect(notification.severity).toBe("info")
  })

  it("1 gün sonraki tekrarlayan kural warning severity ile gelir", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [],
      recurringRules: [
        {
          id: "sub-2",
          name: "Spotify",
          isActive: true,
          nextDate: futureDateStr(1),
          type: "expense",
          amount: 50,
        },
      ],
    })
    const notification = items.find((item) => item.id === "recurring-sub-2")
    expect(notification).toBeDefined()
    expect(notification.severity).toBe("warning")
  })

  it("8 gün sonraki tekrarlayan kural bildirim oluşturmaz", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [],
      recurringRules: [
        {
          id: "sub-3",
          name: "Gelecek ödeme",
          isActive: true,
          nextDate: futureDateStr(8),
          type: "expense",
          amount: 200,
        },
      ],
    })
    expect(items.some((item) => item.id === "recurring-sub-3")).toBe(false)
  })

  it("pasif tekrarlayan kurallar bildirim oluşturmaz", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [],
      recurringRules: [
        {
          id: "sub-4",
          name: "Pasif abonelik",
          isActive: false,
          nextDate: futureDateStr(1),
          type: "expense",
          amount: 100,
        },
      ],
    })
    expect(items.some((item) => item.id === "recurring-sub-4")).toBe(false)
  })

  // ---- Hedef tamamlama ----

  it("%90-99 arası hedef success severity ile bildirim oluşturur", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [
        { id: "goal-car", name: "Araba", isArchived: false, targetAmount: 100000, currentAmount: 92000 },
      ],
      recurringRules: [],
    })
    const notification = items.find((item) => item.id === "goal-goal-car")
    expect(notification).toBeDefined()
    expect(notification.severity).toBe("success")
  })

  it("%100 tamamlanan hedef bildirim oluşturmaz", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [
        { id: "goal-done", name: "Bitti", isArchived: false, targetAmount: 1000, currentAmount: 1000 },
      ],
      recurringRules: [],
    })
    expect(items.some((item) => item.id === "goal-goal-done")).toBe(false)
  })

  it("%89 olan hedef bildirim oluşturmaz", () => {
    const items = buildNotifications({
      txs: [],
      cats: [],
      goals: [
        { id: "goal-low", name: "Devam ediyor", isArchived: false, targetAmount: 1000, currentAmount: 890 },
      ],
      recurringRules: [],
    })
    expect(items.some((item) => item.id === "goal-goal-low")).toBe(false)
  })

  // ---- Sıralama ve limit ----

  it("bildirimleri önem derecesine göre sıralar (danger önce)", () => {
    const items = buildNotifications({
      txs: [
        { id: "income-1", type: "income", amount: 1000, date: monthDate(1) },
        { id: "expense-1", type: "expense", amount: 1200, date: monthDate(2) },
        { id: "expense-2", type: "expense", amount: 1200, date: monthDate(3), cat: "cat-x" },
      ],
      cats: [
        { id: "cat-x", name: "Harcama", isIncome: false, isArchived: false, budget: 1000 },
      ],
      goals: [
        { id: "goal-near", name: "Yakın hedef", isArchived: false, targetAmount: 100, currentAmount: 95 },
      ],
      recurringRules: [],
    })
    const severities = items.map((item) => item.severity)
    const dangerIndex = severities.indexOf("danger")
    const successIndex = severities.indexOf("success")
    if (dangerIndex !== -1 && successIndex !== -1) {
      expect(dangerIndex).toBeLessThan(successIndex)
    }
  })

  it("maksimum 12 bildirim döndürür", () => {
    const cats = Array.from({ length: 20 }, (_, i) => ({
      id: `cat-${i}`,
      name: `Kategori ${i}`,
      isIncome: false,
      isArchived: false,
      budget: 100,
    }))
    const txs = cats.map((cat, i) => ({
      id: `tx-${i}`,
      type: "expense",
      amount: 200,
      date: monthDate(5),
      cat: cat.id,
    }))

    const items = buildNotifications({ txs, cats, goals: [], recurringRules: [] })
    expect(items.length).toBeLessThanOrEqual(12)
  })

  // ---- Pozitif nakit akışı ----

  it("pozitif nakit akışında negative-net bildirimi çıkmaz", () => {
    const items = buildNotifications({
      txs: [
        { id: "income-big", type: "income", amount: 5000, date: monthDate(1) },
        { id: "expense-small", type: "expense", amount: 2000, date: monthDate(2) },
      ],
      cats: [],
      goals: [],
      recurringRules: [],
    })
    expect(items.some((item) => item.id === "negative-net")).toBe(false)
  })
})
