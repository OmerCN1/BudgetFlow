import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  monthKey,
  currentMonthKey,
  previousMonthKey,
  monthLabel,
  transactionsForMonth,
  totalsFor,
  categoryTotals,
  calculateHealthScore,
} from '../finance'

// ---------- monthKey ----------
describe('monthKey', () => {
  it('ISO tarihten YYYY-MM döndürür', () => {
    expect(monthKey('2025-03-15')).toBe('2025-03')
  })

  it('ayın ilk günü için doğru çalışır', () => {
    expect(monthKey('2025-01-01')).toBe('2025-01')
  })

  it('ayın son günü için doğru çalışır', () => {
    expect(monthKey('2025-12-31')).toBe('2025-12')
  })
})

// ---------- currentMonthKey ----------
describe('currentMonthKey', () => {
  it('YYYY-MM formatında döner', () => {
    const result = currentMonthKey()
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })

  it('gerçek yıl ve ayı döndürür', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(currentMonthKey()).toBe(expected)
  })
})

// ---------- previousMonthKey ----------
describe('previousMonthKey', () => {
  it('YYYY-MM formatında döner', () => {
    expect(previousMonthKey()).toMatch(/^\d{4}-\d{2}$/)
  })

  it('currentMonthKey ile aynı değildir', () => {
    expect(previousMonthKey()).not.toBe(currentMonthKey())
  })
})

// ---------- monthLabel ----------
describe('monthLabel', () => {
  it('Ocak ayı için kısa Türkçe etiket döner', () => {
    const label = monthLabel('2025-01')
    expect(label).toContain('Oca')
  })

  it('Aralık ayı için kısa Türkçe etiket döner', () => {
    const label = monthLabel('2025-12')
    expect(label).toContain('Ara')
  })
})

// ---------- transactionsForMonth ----------
describe('transactionsForMonth', () => {
  const txs = [
    { id: '1', date: '2025-03-10', amount: 100, type: 'expense' },
    { id: '2', date: '2025-03-25', amount: 200, type: 'income' },
    { id: '3', date: '2025-04-01', amount: 150, type: 'expense' },
    { id: '4', date: '2024-03-05', amount: 50, type: 'expense' },
  ]

  it('sadece o aya ait işlemleri döndürür', () => {
    const result = transactionsForMonth(txs, '2025-03')
    expect(result).toHaveLength(2)
    expect(result.every(tx => tx.date.startsWith('2025-03'))).toBe(true)
  })

  it('eşleşme yoksa boş dizi döner', () => {
    expect(transactionsForMonth(txs, '2020-01')).toHaveLength(0)
  })

  it('farklı yıl aynı ay karışmaz', () => {
    const result = transactionsForMonth(txs, '2025-03')
    expect(result.some(tx => tx.date.startsWith('2024-03'))).toBe(false)
  })
})

// ---------- totalsFor ----------
describe('totalsFor', () => {
  it('gelir ve gideri ayrı toplar, net hesaplar', () => {
    const txs = [
      { type: 'income', amount: 5000 },
      { type: 'income', amount: 2000 },
      { type: 'expense', amount: 1500 },
      { type: 'expense', amount: 500 },
    ]
    const result = totalsFor(txs)
    expect(result.income).toBe(7000)
    expect(result.expense).toBe(2000)
    expect(result.net).toBe(5000)
  })

  it('boş dizi için hepsi sıfır döner', () => {
    const result = totalsFor([])
    expect(result.income).toBe(0)
    expect(result.expense).toBe(0)
    expect(result.net).toBe(0)
  })

  it('sadece gider varsa net negatif olur', () => {
    const txs = [{ type: 'expense', amount: 1000 }]
    const result = totalsFor(txs)
    expect(result.net).toBe(-1000)
  })
})

// ---------- categoryTotals ----------
describe('categoryTotals', () => {
  const cats = [
    { id: 'cat1', name: 'Market', color: '#ff0000' },
    { id: 'cat2', name: 'Faturalar', color: '#00ff00' },
  ]

  const txs = [
    { type: 'expense', cat: 'cat1', amount: 300 },
    { type: 'expense', cat: 'cat1', amount: 200 },
    { type: 'expense', cat: 'cat2', amount: 500 },
    { type: 'income', cat: 'cat1', amount: 1000 },
  ]

  it('kategori bazlı gider toplamlarını doğru hesaplar', () => {
    const result = categoryTotals(txs, cats)
    const market = result.find(r => r.catId === 'cat1')
    const fatura = result.find(r => r.catId === 'cat2')
    expect(market.value).toBe(500)
    expect(fatura.value).toBe(500)
  })

  it('gelir işlemlerini gider hesabına katmaz', () => {
    const result = categoryTotals(txs, cats)
    const total = result.reduce((s, r) => s + r.value, 0)
    expect(total).toBe(1000)
  })

  it('büyükten küçüğe sıralanır', () => {
    const txs2 = [
      { type: 'expense', cat: 'cat2', amount: 800 },
      { type: 'expense', cat: 'cat1', amount: 200 },
    ]
    const result = categoryTotals(txs2, cats)
    expect(result[0].value).toBeGreaterThanOrEqual(result[1].value)
  })

  it('kategori bulunamazsa isim "Kategori yok" olur', () => {
    const txs3 = [{ type: 'expense', cat: 'unknown', amount: 100 }]
    const result = categoryTotals(txs3, cats)
    expect(result[0].name).toBe('Kategori yok')
  })

  it('tip parametresiyle gelir kategorilerini de getirir', () => {
    const result = categoryTotals(txs, cats, 'income')
    expect(result[0].value).toBe(1000)
  })
})

// ---------- calculateHealthScore ----------
describe('calculateHealthScore', () => {
  const emptyCats = []
  const emptyRisks = []

  it('gelir > gider ise makul skor üretir', () => {
    const score = calculateHealthScore({
      totals: { income: 5000, expense: 2000, net: 3000 },
      budgetRisks: emptyRisks,
      cats: emptyCats,
    })
    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('gider geliri aşarsa skor düşer', () => {
    const score = calculateHealthScore({
      totals: { income: 2000, expense: 3000, net: -1000 },
      budgetRisks: emptyRisks,
      cats: emptyCats,
    })
    expect(score).toBeLessThan(75)
  })

  it('gelir sıfır, gider varsa skor düşer', () => {
    const score = calculateHealthScore({
      totals: { income: 0, expense: 1000, net: -1000 },
      budgetRisks: emptyRisks,
      cats: emptyCats,
    })
    expect(score).toBeLessThan(82)
  })

  it('bütçe aşıldığında skor daha da düşer', () => {
    const scoreWithoutRisk = calculateHealthScore({
      totals: { income: 5000, expense: 2000, net: 3000 },
      budgetRisks: [],
      cats: emptyCats,
    })
    const scoreWithRisk = calculateHealthScore({
      totals: { income: 5000, expense: 2000, net: 3000 },
      budgetRisks: [{ pct: 110 }, { pct: 105 }],
      cats: emptyCats,
    })
    expect(scoreWithRisk).toBeLessThan(scoreWithoutRisk)
  })

  it('skor her zaman 0-100 aralığında kalır', () => {
    const extreme = calculateHealthScore({
      totals: { income: 0, expense: 100000, net: -100000 },
      budgetRisks: [{ pct: 200 }, { pct: 200 }, { pct: 200 }, { pct: 200 }, { pct: 200 }],
      cats: emptyCats,
    })
    expect(extreme).toBeGreaterThanOrEqual(0)
    expect(extreme).toBeLessThanOrEqual(100)
  })

  it('3+ bütçeli kategori skoru artırır', () => {
    const catsNoBudget = [
      { isIncome: false, isArchived: false, budget: 0 },
      { isIncome: false, isArchived: false, budget: 0 },
    ]
    const catsWithBudget = [
      { isIncome: false, isArchived: false, budget: 500 },
      { isIncome: false, isArchived: false, budget: 300 },
      { isIncome: false, isArchived: false, budget: 200 },
    ]
    const scoreWithout = calculateHealthScore({
      totals: { income: 5000, expense: 3000, net: 2000 },
      budgetRisks: [],
      cats: catsNoBudget,
    })
    const scoreWith = calculateHealthScore({
      totals: { income: 5000, expense: 3000, net: 2000 },
      budgetRisks: [],
      cats: catsWithBudget,
    })
    expect(scoreWith).toBeGreaterThan(scoreWithout)
  })
})
