import { useRef, useState } from 'react'
import { CARD_COLORS } from '../lib/cards'
import Modal, { Field, inputClass } from './Modal'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export default function CardModal({ initial, onClose, onSubmit, onDelete }) {
  const editing = !!initial?.id
  const [name, setName] = useState(initial?.name ?? '')
  const [last4, setLast4] = useState(initial?.last4 ?? '')
  const [closingDay, setClosingDay] = useState(initial?.closingDay ?? 25)
  const [dueDay, setDueDay] = useState(initial?.dueDay ?? 10)
  const [limit, setLimit] = useState(initial?.limit ? String(initial.limit) : '')
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0])
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('กรุณาใส่ชื่อบัตร')
    const limitValue = Number.parseFloat(limit.replaceAll(',', ''))
    onSubmit({ ...initial, name: name.trim(), last4, closingDay: Number(closingDay), dueDay: Number(dueDay), limit: limitValue > 0 ? limitValue : null, color })
  }

  return (
    <Modal title={editing ? 'แก้ไขบัตรเครดิต' : 'เพิ่มบัตรเครดิต'} onClose={onClose} initialFocusRef={nameRef}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        {/* Live preview */}
        <div className="flex aspect-[1.75] w-full flex-col justify-between rounded-2xl p-4 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }} aria-hidden>
          <span className="font-semibold">{name || 'ชื่อบัตร'}</span>
          <span className="num text-lg tracking-[0.2em]">•••• {last4 || '0000'}</span>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field label="ชื่อบัตร">
            <input ref={nameRef} value={name} onChange={(e) => { setName(e.target.value); setError('') }} maxLength={30} placeholder="เช่น บัตรหลัก" className={inputClass} />
          </Field>
          <Field label="เลข 4 ตัวท้าย">
            <input inputMode="numeric" value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" className={`num w-24 ${inputClass}`} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="วันตัดรอบบัญชี">
            <select value={closingDay} onChange={(e) => setClosingDay(e.target.value)} className={`num ${inputClass}`}>
              {DAYS.map((d) => <option key={d} value={d}>ทุกวันที่ {d}</option>)}
            </select>
          </Field>
          <Field label="วันครบกำหนดชำระ">
            <select value={dueDay} onChange={(e) => setDueDay(e.target.value)} className={`num ${inputClass}`}>
              {DAYS.map((d) => <option key={d} value={d}>ทุกวันที่ {d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="วงเงิน (บาท)" hint="ไม่บังคับ">
          <input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="เช่น 50000" className={`num ${inputClass}`} />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-muted">สีบัตร</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CARD_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-label={`สี ${c}`} aria-pressed={color === c} className={`h-9 w-12 rounded-lg ring-offset-2 transition ${color === c ? 'ring-2 ring-ink' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </fieldset>

        <p className="rounded-xl bg-canvas px-3 py-2.5 text-xs text-muted">
          ไม่ต้องใส่เลขบัตรเต็ม แอปเก็บข้อมูลไว้ในเครื่องนี้เท่านั้น
        </p>

        {error && <p role="alert" className="text-sm text-expense-strong">{error}</p>}

        <div className="flex gap-3">
          {editing && (
            <button type="button" onClick={onDelete} className="h-12 rounded-2xl px-4 text-sm font-semibold text-expense-strong ring-1 ring-line hover:bg-expense-soft">
              ลบ
            </button>
          )}
          <button type="submit" className="h-12 flex-1 rounded-2xl bg-ink text-base font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.99]">
            {editing ? 'บันทึกการแก้ไข' : 'เพิ่มบัตร'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
