import { Zap, Tags, FileSpreadsheet } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { formatMoney } from '../lib/format'
import { byCategory, daysInPeriod } from '../lib/stats'
import CategoryIcon from './CategoryIcon'

function Block({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-muted" aria-hidden /> {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

// Desktop left bar: quick stats, category filter, export.
export default function Sidebar({ items, totals, period, categoryFilter, onCategory, onExport }) {
  const cats = byCategory(items)
  const totalsById = Object.fromEntries(cats.map((c) => [c.id, c.value]))
  const top = cats[0]

  return (
    <aside className="hidden w-64 shrink-0 space-y-4 lg:block" aria-label="แถบด้านข้าง">
      <Block icon={Zap} title="สรุปด่วน">
        <dl className="space-y-2.5 text-sm">
          <Row label="เฉลี่ยรายจ่าย/วัน" value={`฿${formatMoney(totals.expense / daysInPeriod(period))}`} />
          <Row label="จำนวนรายการ" value={items.length.toLocaleString('th-TH')} />
          <Row label="จ่ายมากสุด" value={top ? `${top.label} ${Math.round(top.share * 100)}%` : '—'} />
        </dl>
      </Block>

      <Block icon={Tags} title="หมวดหมู่">
        <ul className="-mx-1.5 space-y-0.5">
          {CATEGORIES.expense.map((c) => {
            const active = categoryFilter === c.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onCategory(active ? null : c.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left text-sm transition ${active ? 'bg-canvas ring-1 ring-ink/20' : 'hover:bg-canvas'}`}
                >
                  <CategoryIcon id={c.id} size="sm" />
                  <span className="flex-1">{c.label}</span>
                  <span className="num text-muted">{totalsById[c.id] ? formatMoney(totalsById[c.id]) : '—'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Block>

      <button
        type="button"
        onClick={onExport}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-income-strong shadow-sm ring-1 ring-line transition hover:bg-income-soft"
      >
        <FileSpreadsheet className="size-4.5" aria-hidden /> ส่งออก Excel (.csv)
      </button>
    </aside>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="num font-semibold">{value}</dd>
    </div>
  )
}
