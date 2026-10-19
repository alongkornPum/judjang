import { toISODate } from './format'
import { clampDate, startOfToday } from './dates'

/*
 * Billing model: purchases after one closing date up to and including the
 * next form a statement, due on the first `dueDay` after that closing date.
 */

export const CARD_COLORS = [
  '#2D3748', '#111827', '#475569', '#1E3A8A', '#1D4ED8', '#0E7490',
  '#0F766E', '#065F46', '#15803D', '#A16207', '#B45309', '#C2410C',
  '#7C2D12', '#B91C1C', '#9F1239', '#BE185D', '#86198F', '#581C87',
  '#6D28D9', '#4338CA',
]

// Normalizes "#abc" / "abc" / "#aabbcc" to "#AABBCC"; returns null when invalid.
export function normalizeHex(value) {
  const hex = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(hex)) return `#${[...hex].map((c) => c + c).join('')}`.toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex}`.toUpperCase()
  return null
}

export function cardCycle(card, today = startOfToday()) {
  let next = clampDate(today.getFullYear(), today.getMonth(), card.closingDay)
  if (today > next) next = clampDate(today.getFullYear(), today.getMonth() + 1, card.closingDay)
  const last = clampDate(next.getFullYear(), next.getMonth() - 1, card.closingDay)
  const prev = clampDate(next.getFullYear(), next.getMonth() - 2, card.closingDay)
  return { nextClose: next, lastClose: last, prevClose: prev }
}

export function dueAfter(card, closeDate) {
  const due = clampDate(closeDate.getFullYear(), closeDate.getMonth(), card.dueDay)
  return due > closeDate ? due : clampDate(closeDate.getFullYear(), closeDate.getMonth() + 1, card.dueDay)
}

function spent(transactions, cardId, fromExclusive, toInclusive) {
  const from = toISODate(fromExclusive)
  const to = toISODate(toInclusive)
  let sum = 0
  for (const t of transactions) {
    if (t.cardId === cardId && t.type === 'expense' && t.date > from && t.date <= to) sum += t.amount
  }
  return sum
}

export function cardStatus(card, transactions, today = startOfToday()) {
  const { nextClose, lastClose, prevClose } = cardCycle(card, today)
  const todayIso = toISODate(today)

  const current = spent(transactions, card.id, lastClose, nextClose)
  const statement = {
    closeDate: toISODate(lastClose),
    dueDate: toISODate(dueAfter(card, lastClose)),
    amount: spent(transactions, card.id, prevClose, lastClose),
  }
  const statementPaid = statement.amount === 0 || (card.paidStatements ?? []).includes(statement.closeDate)

  // What to show as "next payment": the unpaid statement, or the running cycle as an estimate.
  const upcoming = statementPaid
    ? { closeDate: toISODate(nextClose), dueDate: toISODate(dueAfter(card, nextClose)), amount: current, estimated: true, overdue: false }
    : { ...statement, estimated: false, overdue: statement.dueDate < todayIso }

  const outstanding = current + (statementPaid ? 0 : statement.amount)
  return {
    current,
    nextCloseDate: toISODate(nextClose),
    statement,
    statementPaid,
    upcoming,
    outstanding,
    available: card.limit ? card.limit - outstanding : null,
    utilization: card.limit ? Math.min(1, outstanding / card.limit) : null,
  }
}
