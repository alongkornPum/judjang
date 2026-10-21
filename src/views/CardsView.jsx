import { Check, CreditCard, Pencil, Plus, Undo2 } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { formatShortDate, relativeDays } from '../lib/dates'
import { cardStatus } from '../lib/cards'
import { monthlyCost } from '../lib/subscriptions'

export default function CardsView({ cards, transactions, subscriptions, onAdd, onEdit, onSetPaid }) {
  const statuses = cards.map((c) => ({ card: c, s: cardStatus(c, transactions) }))
  const totalOutstanding = statuses.reduce((sum, x) => sum + x.s.outstanding, 0)
  const nextDue = statuses.filter((x) => x.s.upcoming.amount > 0).sort((a, b) => a.s.upcoming.dueDate.localeCompare(b.s.upcoming.dueDate))[0]

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">บัตรเครดิต</h1>
        <button type="button" onClick={onAdd} className="flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.98]">
          <Plus className="size-4" aria-hidden /> เพิ่มบัตร
        </button>
      </div>

      {cards.length > 0 && (
        <section aria-label="สรุปบัตรเครดิต" className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
            <p className="text-xs font-medium text-muted">ยอดค้างชำระรวม</p>
            <p className="num mt-1 text-xl font-bold">฿{formatMoney(totalOutstanding)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
            <p className="text-xs font-medium text-muted">ครบกำหนดถัดไป</p>
            {nextDue ? (
              <p className="mt-1 font-bold">
                {formatShortDate(nextDue.s.upcoming.dueDate)} <span className="text-sm font-medium text-muted">· {nextDue.card.name}</span>
              </p>
            ) : (
              <p className="mt-1 font-bold text-income-strong">ไม่มียอดค้าง</p>
            )}
          </div>
        </section>
      )}

      {cards.length === 0 ? (
        <Empty onAdd={onAdd} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {statuses.map(({ card, s }) => (
            <CardPanel
              key={card.id}
              card={card}
              s={s}
              subs={subscriptions.filter((x) => x.active && x.cardId === card.id)}
              onEdit={() => onEdit(card)}
              onSetPaid={(paid) => onSetPaid(card.id, s.statement.closeDate, paid)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted">
        รายจ่ายที่เลือก “ชำระด้วยบัตร” ถูกนับในรายจ่ายตั้งแต่วันที่ใช้จ่ายแล้ว การชำระบัตรจึงไม่นับซ้ำเป็นรายจ่าย
      </p>
    </div>
  )
}

function CardPanel({ card, s, subs, onEdit, onSetPaid }) {
  const { upcoming } = s
  const statusTone = upcoming.overdue ? 'bg-expense-soft text-expense-strong' : s.statementPaid && s.statement.amount > 0 ? 'bg-income-soft text-income-strong' : 'bg-amber-50 text-amber-800'

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
      <div className="relative flex aspect-[2.4] flex-col justify-between p-4 text-white md:aspect-auto md:h-36" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}CC)` }}>
        <div className="flex items-start justify-between">
          <span className="font-semibold">{card.name}</span>
          <button type="button" onClick={onEdit} className="-mr-2 -mt-2 grid size-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" aria-label={`แก้ไข ${card.name}`}>
            <Pencil className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="num text-lg tracking-[0.2em]">•••• {card.last4 || '----'}</span>
          <span className="text-right text-xs text-white/80">ตัดรอบวันที่ {card.closingDay}<br />ชำระวันที่ {card.dueDay}</span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted">{upcoming.estimated ? 'ยอดรอบนี้ (ประมาณการ)' : 'ยอดที่ต้องชำระ'}</p>
            <p className="num text-2xl font-bold">฿{formatMoney(upcoming.amount)}</p>
            <p className="text-xs text-muted">ครบกำหนด {formatShortDate(upcoming.dueDate)}</p>
          </div>
          {upcoming.amount > 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${upcoming.overdue ? 'bg-expense-soft text-expense-strong' : 'bg-amber-50 text-amber-800'}`}>
              {relativeDays(upcoming.dueDate)}
            </span>
          )}
        </div>

        {s.statement.amount > 0 && (
          <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm ${statusTone}`}>
            <span className="min-w-0">
              <span className="block font-semibold">
                {s.statementPaid ? '✓ ชำระแล้ว' : upcoming.overdue ? 'เลยกำหนดชำระ' : 'รอชำระ'}
              </span>
              <span className="block text-xs">
                ใบแจ้งหนี้ตัดรอบ {formatShortDate(s.statement.closeDate)} · <span className="num font-semibold">฿{formatMoney(s.statement.amount)}</span>
              </span>
            </span>
            {s.statementPaid ? (
              <button type="button" onClick={() => onSetPaid(false)} className="hit-44 flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 font-medium hover:bg-white/60">
                <Undo2 className="size-3.5" aria-hidden /> ยกเลิก
              </button>
            ) : (
              <button type="button" onClick={() => onSetPaid(true)} className="hit-44 flex h-9 shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 font-semibold shadow-sm hover:bg-white/80">
                <Check className="size-3.5" aria-hidden /> ชำระแล้ว
              </button>
            )}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted">ใช้ไปรอบนี้</dt>
            <dd className="num font-semibold">฿{formatMoney(s.current)}</dd>
            <dd className="text-xs text-muted">ตัดรอบ {formatShortDate(s.nextCloseDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">บริการที่ผูกบัตร</dt>
            <dd className="num font-semibold">{subs.length} รายการ</dd>
            <dd className="num text-xs text-muted">฿{formatMoney(subs.reduce((a, x) => a + monthlyCost(x), 0))}/เดือน</dd>
          </div>
        </dl>

        {card.limit && (
          <div>
            <div className="flex justify-between text-xs text-muted">
              <span>วงเงินคงเหลือ <span className="num font-semibold text-ink">฿{formatMoney(Math.max(0, s.available))}</span></span>
              <span className="num">{Math.round(s.utilization * 100)}% ของ ฿{formatMoney(card.limit)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(s.utilization * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="สัดส่วนการใช้วงเงิน">
              <div className={`h-full rounded-full ${s.utilization > 0.8 ? 'bg-expense' : s.utilization > 0.5 ? 'bg-amber-500' : 'bg-income'}`} style={{ width: `${s.utilization * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function Empty({ onAdd }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-line">
      <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-muted">
        <CreditCard className="size-7" aria-hidden />
      </span>
      <p className="mt-3 font-medium">ยังไม่มีบัตรเครดิต</p>
      <p className="mt-1 text-sm text-muted">เพิ่มบัตรพร้อมวันตัดรอบและวันชำระ แอปจะคำนวณยอดและเตือนวันครบกำหนดให้</p>
      <button type="button" onClick={onAdd} className="mt-4 h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-white">เพิ่มบัตรแรก</button>
    </div>
  )
}
