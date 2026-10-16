import { CATEGORIES } from '../data/categories'
import { formatMonthShort, parseISODate } from './format'

export const PERIODS = [
  { id: 'day', label: 'วันนี้' },
  { id: 'month', label: 'เดือนนี้' },
  { id: 'year', label: 'ปีนี้' },
]

export function inPeriod(iso, period, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number)
  if (y !== now.getFullYear()) return false
  if (period === 'year') return true
  if (m !== now.getMonth() + 1) return false
  return period === 'month' || d === now.getDate()
}

export function sumTotals(items) {
  let income = 0
  let expense = 0
  for (const t of items) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export function byCategory(items, type = 'expense') {
  const totals = new Map()
  for (const t of items) if (t.type === type) totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  const sum = [...totals.values()].reduce((a, b) => a + b, 0)
  return CATEGORIES[type]
    .filter((c) => totals.has(c.id))
    .map((c) => ({ ...c, value: totals.get(c.id), share: sum ? totals.get(c.id) / sum : 0 }))
    .sort((a, b) => b.value - a.value)
}

export function monthlyTrend(items, months = 6, now = new Date()) {
  const buckets = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: formatMonthShort(d.getFullYear(), d.getMonth()), income: 0, expense: 0 })
  }
  const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]))
  for (const t of items) {
    const d = parseISODate(t.date)
    const i = index[`${d.getFullYear()}-${d.getMonth()}`]
    if (i !== undefined) buckets[i][t.type] += t.amount
  }
  return buckets
}

export function daysInPeriod(period, now = new Date()) {
  if (period === 'day') return 1
  if (period === 'month') return now.getDate()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.floor((now - start) / 864e5) + 1
}
