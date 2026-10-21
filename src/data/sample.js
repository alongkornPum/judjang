import { toISODate } from '../lib/format'
import { cardCycle, dueAfter } from '../lib/cards'

export const byNewest = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt

export function createSampleData(now = new Date()) {
  let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const between = (min, max) => Math.round(min + rnd() * (max - min))
  const y = now.getFullYear()
  const m = now.getMonth()

  const cards = [
    { id: 'card-main', name: 'บัตรหลัก', last4: '4821', color: '#1E3A8A', closingDay: 20, dueDay: 5, limit: 50000, paidStatements: [] },
    { id: 'card-shop', name: 'บัตรช้อปปิ้ง', last4: '1937', color: '#9F1239', closingDay: 25, dueDay: 12, limit: 30000, paidStatements: [] },
  ]
  // Treat statements whose due date already passed as paid.
  const today = new Date(y, m, now.getDate())
  for (const c of cards) {
    const { lastClose } = cardCycle(c, today)
    if (dueAfter(c, lastClose) < today) c.paidStatements.push(toISODate(lastClose))
  }

  const transactions = []
  const push = (type, category, amount, date, note = '', cardId = null) =>
    transactions.push({ id: `sample-${transactions.length}`, type, category, amount, date: toISODate(date), note, cardId, createdAt: transactions.length })

  for (let i = 5; i >= 0; i--) {
    push('income', 'salary', 50000, new Date(y, m - i, 1), 'เงินเดือนประจำ')
    const gig = new Date(y, m - i, 12)
    if (i % 2 === 0 && gig <= now) push('income', 'freelance', between(4000, 9000), gig, 'งานออกแบบ')
  }
  for (let d = 0; d < 180; d++) {
    const date = new Date(y, m, now.getDate() - d)
    push('expense', 'food', between(60, 180), date, rnd() < 0.5 ? 'ข้าวกลางวัน' : '')
    if (rnd() < 0.7) push('expense', 'coffee', between(55, 85), date)
    if (rnd() < 0.35) push('expense', 'transport', between(40, 300), date, 'BTS / Grab', rnd() < 0.5 ? 'card-main' : null)
    if (rnd() < 0.1) push('expense', 'shopping', between(300, 2500), date, '', 'card-shop')
    if (rnd() < 0.06) push('expense', 'fun', between(200, 900), date, 'ดูหนัง', 'card-main')
    if (rnd() < 0.03) push('expense', 'health', between(150, 1200), date)
    if (date.getDate() === 5) push('expense', 'bills', between(1800, 2600), date, 'ค่าไฟ / เน็ต', 'card-main')
  }

  // Past charges are back-filled by the subscription sync on first load.
  const monthsAgo = (n, day) => toISODate(new Date(y, m - n, day))
  const subscriptions = [
    { id: 'sub-netflix', name: 'Netflix', amount: 419, cycle: 'monthly', anchorDate: monthsAgo(5, 8), cardId: 'card-main', color: '#E11D48', active: true, lastChargedDate: null },
    { id: 'sub-spotify', name: 'Spotify', amount: 149, cycle: 'monthly', anchorDate: monthsAgo(5, 18), cardId: 'card-main', color: '#16A34A', active: true, lastChargedDate: null },
    { id: 'sub-youtube', name: 'YouTube Premium', amount: 179, cycle: 'monthly', anchorDate: monthsAgo(4, 22), cardId: 'card-shop', color: '#DC2626', active: true, lastChargedDate: null },
    { id: 'sub-icloud', name: 'iCloud+ 50GB', amount: 35, cycle: 'monthly', anchorDate: monthsAgo(5, 3), cardId: null, color: '#2563EB', active: true, lastChargedDate: null },
    { id: 'sub-domain', name: 'โดเมนเว็บไซต์', amount: 450, cycle: 'yearly', anchorDate: toISODate(new Date(y, m, now.getDate() + 9)), cardId: 'card-main', color: '#9333EA', active: true, lastChargedDate: null },
  ]

  // Installments already due are back-filled by the sync too.
  const installments = [
    { id: 'inst-phone', name: 'มือถือใหม่', total: 32900, count: 10, startDate: monthsAgo(2, 15), category: 'shopping', cardId: 'card-shop', lastChargedDate: null },
  ]

  return { transactions: transactions.sort(byNewest), subscriptions, cards, installments }
}
