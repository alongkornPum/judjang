import { ChevronRight, CircleCheck, CreditCard, Plus, SquareStack } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { formatDateWithYear, formatShortDate, relativeDays } from '../lib/dates'
import { installmentAmount, installmentProgress } from '../lib/installments'
import CategoryIcon from '../components/CategoryIcon'

export default function InstallmentsView({ installments, cards, onAdd, onEdit }) {
  const cardById = Object.fromEntries(cards.map((c) => [c.id, c]))
  const rows = installments
    .map((plan) => ({ plan, ...installmentProgress(plan) }))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.next?.date ?? a.endDate).localeCompare(b.next?.date ?? b.endDate))
  const active = rows.filter((r) => !r.done)
  const perMonth = active.reduce((sum, r) => sum + r.next.amount, 0)
  const remaining = active.reduce((sum, r) => sum + r.remaining, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ผ่อนชำระ</h1>
          <p className="text-sm text-muted">กำลังผ่อน {active.length} จาก {installments.length} รายการ</p>
        </div>
        <button type="button" onClick={onAdd} className="flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.98]">
          <Plus className="size-4" aria-hidden /> เพิ่มรายการผ่อน
        </button>
      </div>

      <section aria-label="สรุปยอดผ่อน" className="grid grid-cols-2 gap-3">
        <Stat label="ผ่อนต่อเดือน" value={`฿${formatMoney(perMonth)}`} strong />
        <Stat label="ยอดคงเหลือ" value={`฿${formatMoney(remaining)}`} />
      </section>

      {installments.length === 0 ? (
        <Empty onAdd={onAdd} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
          {rows.map(({ plan, paid, remaining, next, endDate, done }) => {
            const card = cardById[plan.cardId]
            return (
              <li key={plan.id}>
                <button type="button" onClick={() => onEdit(plan)} aria-label={`แก้ไข ${plan.name}`} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-canvas lg:px-5 ${done ? 'opacity-60' : ''}`}>
                  <CategoryIcon id={plan.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{plan.name}</p>
                    <p className="truncate text-sm text-muted">
                      {done ? `ผ่อนครบแล้ว · ${formatDateWithYear(endDate)}` : `งวดที่ ${next.no} · ${formatShortDate(next.date)} · ${relativeDays(next.date)}`}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-label={`จ่ายแล้ว ${paid} จาก ${plan.count} งวด`}
                        aria-valuemin={0}
                        aria-valuemax={plan.count}
                        aria-valuenow={paid}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                      >
                        <div className="h-full rounded-full bg-income-strong transition-[width]" style={{ width: `${(paid / plan.count) * 100}%` }} />
                      </div>
                      <span className="num shrink-0 text-xs font-medium text-muted">
                        {done ? <CircleCheck className="inline size-3.5 text-income-strong" aria-hidden /> : null} {paid}/{plan.count} งวด
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
                      {card ? (
                        <><CreditCard className="size-3.5" aria-hidden /> {card.name}{card.last4 && ` ••${card.last4}`}</>
                      ) : 'เงินสด / โอน'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num font-semibold">฿{formatMoney(next?.amount ?? installmentAmount(plan, 0))}</p>
                    <p className="text-xs text-muted">{done ? `รวม ฿${formatMoney(plan.total)}` : `เหลือ ฿${formatMoney(remaining)}`}</p>
                  </div>
                  <ChevronRight className="hidden size-4 shrink-0 text-muted sm:block" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-center text-xs text-muted">ค่างวดจะถูกบันทึกเป็นรายจ่ายอัตโนมัติเมื่อถึงวันครบกำหนดแต่ละงวด และนับรวมในยอดสรุปทุกหน้า</p>
    </div>
  )
}

function Stat({ label, value, strong }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`num mt-1 font-bold ${strong ? 'text-xl text-expense-strong' : 'text-lg'}`}>{value}</p>
    </div>
  )
}

function Empty({ onAdd }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-line">
      <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-muted">
        <SquareStack className="size-7" aria-hidden />
      </span>
      <p className="mt-3 font-medium">ยังไม่มีรายการผ่อน</p>
      <p className="mt-1 text-sm text-muted">เพิ่มของที่ผ่อนอยู่ เช่น มือถือ 0% 10 เดือน แล้วแอปจะบันทึกค่างวดและนับงวดให้ทุกเดือน</p>
      <button type="button" onClick={onAdd} className="mt-4 h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-white">เพิ่มรายการผ่อนแรก</button>
    </div>
  )
}
