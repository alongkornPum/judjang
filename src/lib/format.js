const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 })

export const formatMoney = (n) => money.format(n)
export const formatCompact = (n) => compact.format(n)
export const formatSigned = (tx) => `${tx.type === 'income' ? '+' : '−'}${money.format(tx.amount)}`

const pad = (n) => String(n).padStart(2, '0')
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => toISODate(new Date())

export const parseISODate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDayHeading(iso) {
  const now = new Date()
  if (iso === toISODate(now)) return 'วันนี้'
  if (iso === toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) return 'เมื่อวาน'
  return parseISODate(iso).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })
}

export const formatMonthShort = (y, m) =>
  new Date(y, m, 1).toLocaleDateString('th-TH', { month: 'short' })
