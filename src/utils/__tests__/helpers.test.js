import { describe, it, expect } from 'vitest'
import { TRY, sum, today, uid } from '../helpers'

// ---------- TRY ----------
describe('TRY', () => {
  it('pozitif sayıyı TL formatında döndürür', () => {
    const result = TRY(1000)
    expect(result).toContain('1.000')
    expect(result).toContain('₺')
  })

  it('sıfırı formatlar', () => {
    const result = TRY(0)
    expect(result).toContain('0')
    expect(result).toContain('₺')
  })

  it('negatif sayıyı formatlar', () => {
    const result = TRY(-500)
    expect(result).toContain('500')
  })

  it('büyük sayılarda nokta ayırıcı kullanır', () => {
    const result = TRY(10000)
    expect(result).toContain('10.000')
  })
})

// ---------- sum ----------
describe('sum', () => {
  it('işlem dizisinin amount toplamını döndürür', () => {
    const txs = [{ amount: 100 }, { amount: 200 }, { amount: 300 }]
    expect(sum(txs)).toBe(600)
  })

  it('boş dizi için sıfır döner', () => {
    expect(sum([])).toBe(0)
  })

  it('tek elemanlı dizi', () => {
    expect(sum([{ amount: 42 }])).toBe(42)
  })

  it('string amount\'u sayıya çevirir', () => {
    expect(sum([{ amount: '150' }, { amount: '50' }])).toBe(200)
  })

  it('amount eksik elemanlarda sıfır sayar', () => {
    const txs = [{ amount: 100 }, {}]
    expect(sum(txs)).toBe(100)
  })
})

// ---------- today ----------
describe('today', () => {
  it('YYYY-MM-DD formatında döner', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('gerçek tarihi döndürür', () => {
    const now = new Date().toISOString().slice(0, 10)
    expect(today()).toBe(now)
  })

  it('10 karakter uzunluğundadır', () => {
    expect(today()).toHaveLength(10)
  })
})

// ---------- uid ----------
describe('uid', () => {
  it('"id" ile başlar', () => {
    expect(uid().startsWith('id')).toBe(true)
  })

  it('her çağrıda farklı değer üretir', () => {
    const ids = new Set(Array.from({ length: 10 }, () => uid()))
    expect(ids.size).toBe(10)
  })

  it('boş string döndürmez', () => {
    expect(uid().length).toBeGreaterThan(0)
  })
})
