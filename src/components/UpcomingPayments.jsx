import { CalendarClock, CreditCard } from 'lucide-react'
import { formatMoney, todayISO } from '../lib/format'
import { daysUntil, formatShortDate, relativeDays } from '../lib/dates'
import { nextBilling } from '../lib/subscriptions'
import { installmentProgress } from '../lib/installments'
import { getCategory } from '../data/categories'
import { cardStatus } from '../lib/cards'

const WINDOW_DAYS = 14

export function upcomingPayments(subscriptions, cards, transactions, installments = []) {
  const today = todayISO()
  const cardName = Object.fromEntries(cards.map((c) => [c.id, c.name]))
  const out = []
  for (const s of subscriptions) {
    if (!s.active) continue
    const date = nextBilling(s, today)
    if (date && daysUntil(date) <= WINDOW_DAYS) out.push({ key: s.id, kind: 'sub', date, title: s.name, amount: s.amount, color: s.color, meta: s.cardId ? cardName[s.cardId] : 'เงินสด / โอน' })
  }
  for (const p of installments) {
    const { next } = installmentProgress(p)
    if (next && daysUntil(next.date) <= WINDOW_DAYS) {
      out.push({ key: p.id, kind: 'inst', date: next.date, title: p.name, amount: next.amount, color: getCategory(p.category).color, meta: `งวด ${next.no}/${p.count} · ${p.cardId ? cardName[p.cardId] : 'เงินสด / โอน'}` })
    }
  }
  for (const c of cards) {
    const { upcoming } = cardStatus(c, transactions, installments)
    if (upcoming.amount > 0 && (upcoming.overdue || daysUntil(upcoming.dueDate) <= WINDOW_DAYS)) {
      out.push({ key: c.id, kind: 'card', date: upcoming.dueDate, title: `ชำระบัตร ${c.name}`, amount: upcoming.amount, color: c.color, overdue: upcoming.overdue, meta: upcoming.estimated ? 'ยอดประมาณการ' : 'ยอดตามใบแจ้งหนี้' })
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export default function UpcomingPayments({ items, onOpen }) {
  if (!items.length) return null
  return (
    <section aria-labelledby="upcoming-heading" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line lg:p-5">
      <div className="flex items-center justify-between">
        <h2 id="upcoming-heading" className="flex items-center gap-2 font-semibold">
          <CalendarClock className="size-4.5 text-muted" aria-hidden /> กำลังจะถึงกำหนด
        </h2>
        <span className="text-xs text-muted">{WINDOW_DAYS} วันข้างหน้า</span>
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((p) => (
          <li key={`${p.kind}-${p.key}`}>
            <button type="button" onClick={() => onOpen(p.kind)} className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-canvas">
              {p.kind === 'card' ? (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: p.color }}>
                  <CreditCard className="size-4.5" aria-hidden />
                </span>
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: p.color }} aria-hidden>
                  {p.title.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.title}</span>
                <span className="block truncate text-xs text-muted">{formatShortDate(p.date)} · {p.meta}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="num block font-semibold">฿{formatMoney(p.amount)}</span>
                <span className={`block text-xs font-medium ${p.overdue ? 'text-expense-strong' : daysUntil(p.date) <= 3 ? 'text-amber-700' : 'text-muted'}`}>
                  {relativeDays(p.date)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
