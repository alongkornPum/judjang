import { PERIODS } from '../lib/stats'

export default function PeriodTabs({ value, onChange }) {
  const onKeyDown = (e) => {
    const i = PERIODS.findIndex((p) => p.id === value)
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = PERIODS[(i + step + PERIODS.length) % PERIODS.length]
    onChange(next.id)
    e.currentTarget.querySelector(`[data-id="${next.id}"]`)?.focus()
  }

  return (
    <div role="tablist" aria-label="ช่วงเวลา" onKeyDown={onKeyDown} className="inline-flex w-full rounded-xl bg-line/70 p-1 sm:w-auto">
      {PERIODS.map((p) => {
        const active = p.id === value
        return (
          <button
            key={p.id}
            data-id={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(p.id)}
            className={`h-10 flex-1 rounded-lg px-5 text-sm font-medium transition sm:flex-none ${
              active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
