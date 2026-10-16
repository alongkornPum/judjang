import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { todayISO } from '../lib/format'

const FOCUSABLE = 'button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

/*
 * Built for the 3-second entry goal: amount is autofocused with a numeric
 * keypad, a category is preselected, and Enter saves.
 */
export default function AddTransactionModal({ initialType = 'expense', onClose, onSubmit }) {
  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[initialType][0].id)
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const amountRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    amountRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return onClose()
    if (e.key !== 'Tab') return
    const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
    const first = nodes[0]
    const last = nodes.at(-1)
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const switchType = (t) => {
    setType(t)
    setCategory(CATEGORIES[t][0].id)
  }

  const submit = (e) => {
    e.preventDefault()
    const value = Number.parseFloat(amount.replaceAll(',', ''))
    if (!(value > 0)) {
      setError('กรุณากรอกจำนวนเงินมากกว่า 0')
      amountRef.current?.focus()
      return
    }
    onSubmit({ type, amount: Math.round(value * 100) / 100, category, date: date || todayISO(), note: note.trim() })
  }

  const income = type === 'income'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-title"
        className="relative max-h-[92dvh] w-full animate-sheet-up overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-5 sm:pt-5"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 id="add-title" className="text-lg font-semibold">บันทึกรายการ</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink" aria-label="ปิด">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-5">
          <div role="radiogroup" aria-label="ประเภทรายการ" className="grid grid-cols-2 rounded-xl bg-canvas p-1 ring-1 ring-line">
            {[
              { id: 'expense', label: 'รายจ่าย', active: 'bg-expense-strong text-white' },
              { id: 'income', label: 'รายรับ', active: 'bg-income-strong text-white' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={type === t.id}
                onClick={() => switchType(t.id)}
                className={`h-10 rounded-lg text-sm font-semibold transition ${type === t.id ? `${t.active} shadow-sm` : 'text-muted hover:text-ink'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="amount" className="text-sm font-medium text-muted">จำนวนเงิน</label>
            <div className={`mt-1.5 flex items-center gap-2 rounded-2xl border-2 px-4 transition-colors ${error ? 'border-expense' : 'border-line focus-within:border-ink'}`}>
              <span className={`num text-3xl font-semibold ${income ? 'text-income-strong' : 'text-expense-strong'}`} aria-hidden>฿</span>
              <input
                ref={amountRef}
                id="amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^\d.,]/g, ''))
                  setError('')
                }}
                aria-invalid={!!error}
                aria-describedby={error ? 'amount-error' : undefined}
                className="num h-16 w-full bg-transparent text-4xl font-bold tracking-tight placeholder:text-line focus:outline-none"
              />
            </div>
            {error && <p id="amount-error" role="alert" className="mt-1.5 text-sm text-expense-strong">{error}</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-muted">หมวดหมู่</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CATEGORIES[type].map((c) => {
                const Icon = c.icon
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c.id)}
                    className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium ring-1 transition ${
                      active ? 'bg-ink/[0.04] text-ink ring-2 ring-ink' : 'text-muted ring-line hover:bg-canvas'
                    }`}
                  >
                    <span className="grid size-8 place-items-center rounded-xl" style={{ backgroundColor: `${c.color}1A`, color: c.color }}>
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    {c.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-[auto_1fr] gap-3">
            <label className="block">
              <span className="text-sm font-medium text-muted">วันที่</span>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="num mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm focus:border-ink/40 focus:bg-white focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted">บันทึก <span className="font-normal">(ไม่บังคับ)</span></span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
                placeholder="เช่น ข้าวมันไก่"
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm placeholder:text-muted/70 focus:border-ink/40 focus:bg-white focus:outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            className={`h-13 w-full rounded-2xl text-base font-semibold text-white shadow-sm transition active:scale-[0.99] ${
              income ? 'bg-income-strong hover:bg-income-strong/90' : 'bg-expense-strong hover:bg-expense-strong/90'
            }`}
          >
            บันทึก{income ? 'รายรับ' : 'รายจ่าย'}
          </button>
        </form>
      </div>
    </div>
  )
}
