import { getCategory } from '../data/categories'
import { todayISO } from './format'

const escape = (v) => `"${String(v).replaceAll('"', '""')}"`

// UTF-8 BOM so Excel renders Thai correctly.
export function exportCsv(items, cards = []) {
  const cardName = Object.fromEntries(cards.map((c) => [c.id, c.name]))
  const rows = [
    ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'ชำระด้วย', 'บันทึก'],
    ...items.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      getCategory(t.category).label,
      t.amount.toFixed(2),
      t.type === 'expense' ? (cardName[t.cardId] ?? 'เงินสด / โอน') : '',
      t.note ?? '',
    ]),
  ]
  const csv = '﻿' + rows.map((r) => r.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `judjang-${todayISO()}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}
