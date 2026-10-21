import { ChevronRight, CreditCard, Plus, Repeat } from 'lucide-react'
import { formatMoney, todayISO } from '../lib/format'
import { formatShortDate, relativeDays } from '../lib/dates'
import { CYCLES, monthlyCost, nextBilling } from '../lib/subscriptions'

export default function SubscriptionsView({ subscriptions, cards, onAdd, onEdit, onToggle }) {
  const today = todayISO()
  const active = subscriptions.filter((s) => s.active)
  const perMonth = active.reduce((sum, s) => sum + monthlyCost(s), 0)
  const cardById = Object.fromEntries(cards.map((c) => [c.id, c]))
  const sorted = [...subscriptions].sort((a, b) => Number(b.active) - Number(a.active) || (nextBilling(a, today) ?? '').localeCompare(nextBilling(b, today) ?? ''))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">ใช้งานอยู่ {active.length} จาก {subscriptions.length} รายการ</p>
        <button type="button" onClick={onAdd} className="flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.98]">
          <Plus className="size-4" aria-hidden /> เพิ่มบริการ
        </button>
      </div>

      <section aria-label="สรุปค่าบริการ" className="grid grid-cols-2 gap-3">
        <Stat label="เฉลี่ยต่อเดือน" value={`฿${formatMoney(perMonth)}`} strong />
        <Stat label="ต่อปี" value={`฿${formatMoney(perMonth * 12)}`} />
      </section>

      {subscriptions.length === 0 ? (
        <Empty onAdd={onAdd} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
          {sorted.map((s) => {
            const next = s.active ? nextBilling(s, today) : null
            const card = cardById[s.cardId]
            return (
              <li key={s.id} className="flex items-center gap-1 pr-2 lg:pr-3">
                <button type="button" onClick={() => onEdit(s)} aria-label={`แก้ไข ${s.name}`} className={`flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 text-left transition hover:bg-canvas lg:pl-5 ${s.active ? '' : 'opacity-60'}`}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl text-base font-bold text-white" style={{ backgroundColor: s.color }} aria-hidden>
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug wrap-anywhere">{s.name}</p>
                  <p className="text-sm text-muted">
                    {next ? `${formatShortDate(next)} · ${relativeDays(next)}` : 'หยุดชั่วคราว'}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                    {card ? (
                      <><CreditCard className="size-3.5" aria-hidden /> {card.name}{card.last4 && ` ••${card.last4}`}</>
                    ) : 'เงินสด / โอน'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num font-semibold">฿{formatMoney(s.amount)}</p>
                  <p className="text-xs text-muted">{CYCLES[s.cycle].short}</p>
                </div>
                <ChevronRight className="hidden size-4 shrink-0 text-muted sm:block" aria-hidden />
                </button>
                <Switch checked={s.active} onChange={() => onToggle(s.id)} label={`${s.active ? 'หยุด' : 'เปิด'}การตัดเงิน ${s.name}`} />
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-center text-xs text-muted">ค่าบริการจะถูกบันทึกเป็นรายจ่ายอัตโนมัติเมื่อถึงวันตัดเงิน และนับรวมในยอดสรุปทุกหน้า</p>
    </div>
  )
}

function Stat({ label, value, strong }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`num mt-1 font-bold ${strong ? 'text-xl' : 'text-lg text-muted'}`}>{value}</p>
    </div>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className="grid h-11 w-12 shrink-0 place-items-center rounded-full">
      <span className={`relative block h-6 w-10 rounded-full transition-colors ${checked ? 'bg-income-strong' : 'bg-slate-300'}`}>
        <span className={`absolute left-0.5 top-0.5 block size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

function Empty({ onAdd }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-line">
      <span className="grid size-14 place-items-center rounded-2xl bg-canvas text-muted">
        <Repeat className="size-7" aria-hidden />
      </span>
      <p className="mt-3 font-medium">ยังไม่มีบริการรายเดือน</p>
      <p className="mt-1 text-sm text-muted">เพิ่ม Netflix, Spotify, iCloud หรือค่าบริการอื่นๆ แล้วแอปจะบันทึกรายจ่ายให้ทุกรอบ</p>
      <button type="button" onClick={onAdd} className="mt-4 h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-white">เพิ่มบริการแรก</button>
    </div>
  )
}
