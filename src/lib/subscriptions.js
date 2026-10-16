import { parseISODate, toISODate } from './format'
import { clampDate } from './dates'

/*
 * A subscription bills on `anchorDate` and every month/year after it.
 * `lastChargedDate` is the latest billing date already recorded as an expense.
 */

export const CYCLES = {
  monthly: { label: 'รายเดือน', short: '/เดือน' },
  yearly: { label: 'รายปี', short: '/ปี' },
}

function nthBilling(sub, n) {
  const a = parseISODate(sub.anchorDate)
  return sub.cycle === 'yearly'
    ? clampDate(a.getFullYear() + n, a.getMonth(), a.getDate())
    : clampDate(a.getFullYear(), a.getMonth() + n, a.getDate())
}

function* billingDates(sub) {
  for (let n = 0; n < 1200; n++) yield toISODate(nthBilling(sub, n))
}

// Billing dates up to today that have not been recorded yet.
export function pendingCharges(sub, todayIso) {
  if (!sub.active) return []
  const out = []
  for (const iso of billingDates(sub)) {
    if (iso > todayIso) break
    if (!sub.lastChargedDate || iso > sub.lastChargedDate) out.push(iso)
  }
  return out
}

export function nextBilling(sub, todayIso) {
  for (const iso of billingDates(sub)) {
    if (iso >= todayIso && (!sub.lastChargedDate || iso > sub.lastChargedDate)) return iso
  }
  return null
}

// On resume, skip the dates missed while paused (today still charges).
export function lastBillingBefore(sub, todayIso) {
  let prev = null
  for (const iso of billingDates(sub)) {
    if (iso >= todayIso) break
    prev = iso
  }
  return prev
}

export const monthlyCost = (sub) => (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount)

export const SUB_COLORS = ['#E11D48', '#16A34A', '#2563EB', '#9333EA', '#EA580C', '#0891B2', '#CA8A04', '#475569']
