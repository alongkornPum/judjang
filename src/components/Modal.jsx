import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

// Bottom sheet on mobile, centred dialog from `sm` up. Traps focus, closes on Esc.
export default function Modal({ title, onClose, children, initialFocusRef }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    ;(initialFocusRef?.current ?? dialogRef.current.querySelector(FOCUSABLE))?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [initialFocusRef])

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative max-h-[92dvh] w-full animate-sheet-up overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-5 sm:pt-5"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-2 grid size-11 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink" aria-label="ปิด">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const inputClass =
  'mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-base placeholder:text-muted/70 focus:border-ink/40 focus:bg-white focus:outline-none sm:text-sm'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">
        {label} {hint && <span className="font-normal">({hint})</span>}
      </span>
      {children}
    </label>
  )
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid rounded-xl bg-line/70 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-10 rounded-lg text-sm font-semibold transition ${value === o.id ? `${o.active ?? 'bg-white text-ink'} shadow-sm` : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// "Paid with": cash/transfer or one of the user's cards.
export function PaymentPicker({ cards, value, onChange }) {
  if (!cards.length) return null
  const options = [{ id: null, label: 'เงินสด / โอน' }, ...cards.map((c) => ({ id: c.id, label: `${c.name}${c.last4 ? ` ••${c.last4}` : ''}`, color: c.color }))]
  return (
    <fieldset>
      <legend className="text-sm font-medium text-muted">ชำระด้วย</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = (value ?? null) === o.id
          return (
            <button
              key={o.id ?? 'cash'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.id)}
              className={`flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium ring-1 transition ${active ? 'bg-ink/[0.04] text-ink ring-2 ring-ink' : 'text-muted ring-line hover:bg-canvas'}`}
            >
              {o.color && <span className="h-3 w-4.5 rounded-[3px]" style={{ backgroundColor: o.color }} aria-hidden />}
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
