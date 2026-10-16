import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react'
import { formatMoney } from '../lib/format'

const PERIOD_CAPTION = { day: 'วันนี้', month: 'เดือนนี้', year: 'ปีนี้' }

// Mobile: one hero balance card. Desktop: three KPI cards.
export default function SummaryCards({ totals, period }) {
  const { income, expense, balance } = totals
  const negative = balance < 0

  return (
    <section aria-label="สรุปยอด">
      <div className="rounded-3xl bg-ink p-5 text-white shadow-lg shadow-ink/15 lg:hidden">
        <p className="text-sm text-white/70">ยอดคงเหลือสุทธิ · {PERIOD_CAPTION[period]}</p>
        <p className="num mt-1 text-4xl font-bold tracking-tight">
          {negative && '−'}฿{formatMoney(Math.abs(balance))}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Pill label="รายรับ" value={income} up />
          <Pill label="รายจ่าย" value={expense} />
        </div>
      </div>

      <div className="hidden grid-cols-3 gap-5 lg:grid">
        <Kpi label="รายรับรวม" value={income} tone="income" icon={ArrowUpRight} caption={PERIOD_CAPTION[period]} />
        <Kpi label="รายจ่ายรวม" value={expense} tone="expense" icon={ArrowDownRight} caption={PERIOD_CAPTION[period]} />
        <Kpi
          label="คงเหลือสุทธิ"
          value={balance}
          tone={negative ? 'expense' : 'ink'}
          icon={Scale}
          caption={income > 0 ? `เก็บได้ ${Math.max(0, Math.round((balance / income) * 100))}% ของรายรับ` : PERIOD_CAPTION[period]}
        />
      </div>
    </section>
  )
}

function Pill({ label, value, up }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <div className="rounded-2xl bg-white/10 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-xs text-white/75">
        <span className={`grid size-5 place-items-center rounded-full ${up ? 'bg-income' : 'bg-expense'}`}>
          <Icon className="size-3.5 text-white" strokeWidth={2.6} aria-hidden />
        </span>
        {label}
      </p>
      <p className="num mt-1 truncate text-lg font-semibold">฿{formatMoney(value)}</p>
    </div>
  )
}

const TONES = {
  income: { badge: 'bg-income-soft text-income-strong', value: 'text-income-strong' },
  expense: { badge: 'bg-expense-soft text-expense-strong', value: 'text-expense-strong' },
  ink: { badge: 'bg-slate-100 text-ink', value: 'text-ink' },
}

function Kpi({ label, value, tone, icon: Icon, caption }) {
  const t = TONES[tone]
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${t.badge}`}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className={`num mt-3 text-[1.75rem] font-bold leading-tight tracking-tight ${t.value}`}>
        {value < 0 && '−'}฿{formatMoney(Math.abs(value))}
      </p>
      <p className="mt-1 text-xs text-muted">{caption}</p>
    </div>
  )
}
