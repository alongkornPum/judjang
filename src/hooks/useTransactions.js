import { useCallback, useEffect, useState } from 'react'
import { toISODate } from '../lib/format'

const KEY = 'judjang:transactions:v1'

// crypto.randomUUID needs a secure context, which a file opened from a phone may not be.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const byNewest = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // storage unavailable: fall back to sample data
  }
  return createSampleData()
}

export function useTransactions() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      // private mode / quota: keep working in memory
    }
  }, [items])

  const add = useCallback((tx) => {
    setItems((prev) => [{ ...tx, id: newId(), createdAt: Date.now() }, ...prev].sort(byNewest))
  }, [])
  const remove = useCallback((id) => setItems((prev) => prev.filter((t) => t.id !== id)), [])
  const restore = useCallback((tx) => setItems((prev) => [tx, ...prev].sort(byNewest)), [])
  const clear = useCallback(() => setItems([]), [])
  const loadSample = useCallback(() => setItems(createSampleData()), [])

  return { items, add, remove, restore, clear, loadSample }
}

export function createSampleData(now = new Date()) {
  let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const between = (min, max) => Math.round(min + rnd() * (max - min))
  const out = []
  const push = (type, category, amount, date, note = '') =>
    out.push({ id: `sample-${out.length}`, type, category, amount, date: toISODate(date), note, createdAt: out.length })

  for (let m = 5; m >= 0; m--) {
    push('income', 'salary', 50000, new Date(now.getFullYear(), now.getMonth() - m, 1), 'เงินเดือนประจำ')
    const gig = new Date(now.getFullYear(), now.getMonth() - m, 12)
    if (m % 2 === 0 && gig <= now) push('income', 'freelance', between(4000, 9000), gig, 'งานออกแบบ')
  }
  for (let d = 0; d < 180; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d)
    push('expense', 'food', between(60, 180), date, rnd() < 0.5 ? 'ข้าวกลางวัน' : '')
    if (rnd() < 0.7) push('expense', 'coffee', between(55, 85), date)
    if (rnd() < 0.35) push('expense', 'transport', between(40, 300), date, 'BTS / Grab')
    if (rnd() < 0.1) push('expense', 'shopping', between(300, 2500), date)
    if (rnd() < 0.06) push('expense', 'fun', between(200, 900), date, 'ดูหนัง')
    if (rnd() < 0.03) push('expense', 'health', between(150, 1200), date)
    if (date.getDate() === 5) push('expense', 'bills', between(1800, 2600), date, 'ค่าไฟ / เน็ต')
  }
  return out.sort(byNewest)
}
