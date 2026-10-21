import { parseISODate, toISODate } from './format'
import { clampDate } from './dates'

/*
 * A plan pays `total` in `count` monthly installments starting on `startDate`
 * (month-end clamped). The last installment absorbs rounding.
 * `lastChargedDate` is the latest installment already recorded as an expense.
 */

export const MAX_INSTALLMENTS = 120

const round2 = (n) => Math.round(n * 100) / 100

export function installmentAmount(plan, n) {
  const each = round2(plan.total / plan.count)
  return n === plan.count - 1 ? round2(plan.total - each * (plan.count - 1)) : each
}

export function schedule(plan) {
  const a = parseISODate(plan.startDate)
  return Array.from({ length: plan.count }, (_, n) => ({
    no: n + 1,
    date: toISODate(clampDate(a.getFullYear(), a.getMonth() + n, a.getDate())),
    amount: installmentAmount(plan, n),
  }))
}

// Installments due up to today that have not been recorded yet.
export const pendingInstallments = (plan, todayIso) =>
  schedule(plan).filter((i) => i.date <= todayIso && (!plan.lastChargedDate || i.date > plan.lastChargedDate))

export function installmentProgress(plan) {
  const all = schedule(plan)
  const paid = plan.lastChargedDate ? all.filter((i) => i.date <= plan.lastChargedDate).length : 0
  const paidAmount = all.slice(0, paid).reduce((a, i) => a + i.amount, 0)
  return {
    paid,
    remaining: round2(plan.total - paidAmount),
    next: all[paid] ?? null,
    endDate: all.at(-1).date,
    done: paid === plan.count,
  }
}
