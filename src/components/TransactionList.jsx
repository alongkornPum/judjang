import { useMemo, useState } from 'react'
import { ChevronDown, CreditCard, Plus, Repeat, Search, Trash2, X, Inbox } from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatDayHeading, formatMoney, formatSigned } from '../lib/format'
import CategoryIcon from './CategoryIcon'

const TYPE_FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'income', label: 'รายรับ' },
  { id: 'expense', label: 'รายจ่าย' },
]

const PAGE = 20

export default function TransactionList({ items, cards = [], categoryFilter, onClearCategory, onDelete, onAdd }) {
  const cardById = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])), [cards])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [limit, setLimit] = useState(PAGE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((t) => {
      if (type !== 'all' && t.type !== type) return false
      if (categoryFilter && t.category !== categoryFilter) return false
      if (!q) return true
      return getCategory(t.category).label.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q) || String(t.amount).includes(q)
    })
  }, [items, query, type, categoryFilter])

  const groups = useMemo(() => {
    const out = []
    for (const t of filtered.slice(0, limit)) {
      const last = out.at(-1)
      if (last?.date === t.date) last.items.push(t)
      else out.push({ date: t.date, items: [t] })
    }
    return out
  }, [filtered, limit])

  return (
    <section aria-labelledby="tx-heading" className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:px-5">
        <h2 id="tx-heading" className="whitespace-nowrap font-semibold">
          รายการล่าสุด <span className="num text-sm font-normal text-muted">({filtered.length})</span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-income-soft px-3 text-sm font-semibold text-income-strong transition hover:bg-income/15 lg:flex"
        >
          <Plus className="size-4" aria-hidden /> เพิ่มรายการใหม่
        </button>
      </div>

      <div className="space-y-3 px-4 pt-3 lg:px-5">
        <label className="relative block">
          <span className="sr-only">ค้นหารายการ</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา หมวดหมู่ / บันทึก / จำนวนเงิน"
            className="h-11 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-muted/80 focus:border-ink/40 focus:bg-white focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={type === f.id}
              onClick={() => setType(f.id)}
              className={`h-9 rounded-full px-3.5 text-sm font-medium transition ${
                type === f.id ? 'bg-ink text-white' : 'bg-canvas text-muted ring-1 ring-line hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
          {categoryFilter && (
            <button
              type="button"
              onClick={onClearCategory}
              className="flex h-9 items-center gap-1 rounded-full bg-sky-50 pl-3.5 pr-2.5 text-sm font-medium text-sky-800 ring-1 ring-sky-200"
            >
              {getCategory(categoryFilter).label}
              <X className="size-4" aria-label="ล้างตัวกรองหมวดหมู่" />
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-muted">
            <Inbox className="size-7" aria-hidden />
          </span>
          <p className="mt-3 font-medium">ยังไม่มีรายการ</p>
          <p className="mt-1 text-sm text-muted">ลองเปลี่ยนช่วงเวลา หรือกด + เพื่อบันทึกรายการแรก</p>
        </div>
      ) : (
        <div className="pb-2 pt-2">
          {groups.map((g) => (
            <div key={g.date}>
              <h3 className="sticky top-16 z-[1] bg-white/95 px-4 pb-1 pt-3 text-xs font-semibold text-muted backdrop-blur lg:static lg:px-5">
                {formatDayHeading(g.date)}
              </h3>
              <ul>
                {g.items.map((t) => (
                  <TransactionRow key={t.id} tx={t} card={cardById[t.cardId]} onDelete={onDelete} />
                ))}
              </ul>
            </div>
          ))}
          {filtered.length > limit && (
            <div className="px-4 pb-3 pt-2 lg:px-5">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="h-11 w-full rounded-xl text-sm font-medium text-muted ring-1 ring-line transition hover:bg-canvas hover:text-ink"
              >
                แสดงเพิ่ม ({filtered.length - limit} รายการ)
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// Progressive disclosure: tap a row to reveal date, note and delete.
function TransactionRow({ tx, card, onDelete }) {
  const [open, setOpen] = useState(false)
  const c = getCategory(tx.category)
  const income = tx.type === 'income'

  return (
    <li className="px-2 lg:px-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-canvas"
      >
        <CategoryIcon id={tx.category} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{c.label}</span>
          {tx.note && <span className="block truncate text-sm text-muted">{tx.note}</span>}
          {(card || tx.subscriptionId) && (
            <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
              {tx.subscriptionId && (
                <span className="flex items-center gap-1"><Repeat className="size-3" aria-hidden /> อัตโนมัติ</span>
              )}
              {card && (
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-3.5 rounded-[2px]" style={{ backgroundColor: card.color }} aria-hidden />
                  {card.name}{card.last4 && ` ••${card.last4}`}
                </span>
              )}
            </span>
          )}
        </span>
        <span className={`num shrink-0 font-semibold ${income ? 'text-income-strong' : 'text-ink'}`}>{formatSigned(tx)}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="mx-2 mb-2 flex animate-fade-in items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2.5 text-sm">
          <dl className="min-w-0 text-muted">
            <div className="flex gap-1.5">
              <dt>ประเภท:</dt>
              <dd className={income ? 'text-income-strong' : 'text-expense-strong'}>{income ? 'รายรับ' : 'รายจ่าย'}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>จำนวน:</dt>
              <dd className="num text-ink">฿{formatMoney(tx.amount)}</dd>
            </div>
            {!income && (
              <div className="flex gap-1.5">
                <dt>ชำระด้วย:</dt>
                <dd className="flex items-center gap-1 text-ink">
                  {card ? <><CreditCard className="size-3.5" aria-hidden />{card.name}</> : 'เงินสด / โอน'}
                </dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={() => onDelete(tx)}
            className="flex h-10 items-center gap-1.5 rounded-lg px-3 font-medium text-expense-strong transition hover:bg-expense-soft"
          >
            <Trash2 className="size-4" aria-hidden /> ลบ
          </button>
        </div>
      )}
    </li>
  )
}
