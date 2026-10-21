import { parseISODate, toISODate } from './format'

const daysIn = (y, m) => new Date(y, m + 1, 0).getDate()

// Day-of-month in a (possibly overflowing) month, clamped: day 31 in Feb -> Feb 28/29.
export function clampDate(y, m, day) {
  const first = new Date(y, m, 1)
  return new Date(first.getFullYear(), first.getMonth(), Math.min(day, daysIn(first.getFullYear(), first.getMonth())))
}

export const startOfToday = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export const daysUntil = (iso, today = startOfToday()) => Math.round((parseISODate(iso) - today) / 864e5)

export function relativeDays(iso, today) {
  const n = daysUntil(iso, today)
  if (n === 0) return 'วันนี้'
  if (n === 1) return 'พรุ่งนี้'
  if (n < 0) return `เลยกำหนด ${-n} วัน`
  return `อีก ${n} วัน`
}

export const formatShortDate = (iso) =>
  parseISODate(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

export const formatDateWithYear = (iso) =>
  parseISODate(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })

export const addDaysISO = (iso, n) => {
  const d = parseISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
