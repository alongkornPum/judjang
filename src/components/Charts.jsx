import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatMoney } from '../lib/format'

function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line lg:p-5 ${className}`}>
      <h2 className="font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const [inc, exp] = payload
  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      <p className="num">รายรับ ฿{formatMoney(inc.value)}</p>
      <p className="num">รายจ่าย ฿{formatMoney(exp.value)}</p>
    </div>
  )
}

export function TrendChart({ data }) {
  return (
    <Card title="รายรับ–รายจ่ายรายเดือน" subtitle="6 เดือนล่าสุด">
      <div className="mb-2 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-income" />รายรับ</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-expense" />รายจ่าย</span>
      </div>
      <div className="h-60" role="img" aria-label={data.map((d) => `${d.label}: รายรับ ${formatMoney(d.income)} รายจ่าย ${formatMoney(d.expense)}`).join(', ')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E9ECEF" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={formatCompact} width={48} />
            <Tooltip content={<TrendTooltip />} cursor={{ fill: '#F1F3F5' }} />
            <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={22} />
            <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function CategoryDonut({ data, onSelect, selected, title = 'สัดส่วนรายจ่ายตามหมวดหมู่', centerLabel = 'รายจ่ายรวม' }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card title={title}>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">ยังไม่มีข้อมูลในช่วงเวลานี้</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative size-48 shrink-0" role="img" aria-label={data.map((d) => `${d.label} ${Math.round(d.share * 100)}%`).join(', ')}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell key={d.id} fill={d.color} opacity={selected && selected !== d.id ? 0.3 : 1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-xs text-muted">{centerLabel}</span>
              <span className="num text-lg font-bold">฿{formatCompact(total)}</span>
            </div>
          </div>
          <ul className="w-full space-y-1">
            {data.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(selected === d.id ? null : d.id)}
                  aria-pressed={selected === d.id}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-canvas ${selected === d.id ? 'bg-canvas' : ''}`}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="flex-1 truncate">{d.label}</span>
                  <span className="num text-muted">{Math.round(d.share * 100)}%</span>
                  <span className="num w-24 text-right font-medium">{formatMoney(d.value)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
