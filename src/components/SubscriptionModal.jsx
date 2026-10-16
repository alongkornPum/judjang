import { useRef, useState } from 'react'
import { todayISO } from '../lib/format'
import { CYCLES, SUB_COLORS } from '../lib/subscriptions'
import Modal, { Field, PaymentPicker, Segmented, inputClass } from './Modal'

export default function SubscriptionModal({ initial, cards, onClose, onSubmit, onDelete }) {
  const editing = !!initial?.id
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [cycle, setCycle] = useState(initial?.cycle ?? 'monthly')
  const [anchorDate, setAnchorDate] = useState(initial?.anchorDate ?? todayISO())
  const [cardId, setCardId] = useState(initial?.cardId ?? null)
  const [color, setColor] = useState(initial?.color ?? SUB_COLORS[Math.floor(Math.random() * SUB_COLORS.length)])
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    const value = Number.parseFloat(amount.replaceAll(',', ''))
    if (!name.trim()) return setError('กรุณาใส่ชื่อบริการ')
    if (!(value > 0)) return setError('กรุณากรอกราคามากกว่า 0')
    const base = { name: name.trim(), amount: Math.round(value * 100) / 100, cycle, cardId, color }
    // Changing the billing date restarts the schedule from that date.
    const reschedule = !editing || anchorDate !== initial.anchorDate
    onSubmit(editing ? { ...initial, ...base, ...(reschedule && { anchorDate, lastChargedDate: null }) } : { ...base, anchorDate, active: true, lastChargedDate: null })
  }

  return (
    <Modal title={editing ? 'แก้ไขบริการรายเดือน' : 'เพิ่มบริการรายเดือน'} onClose={onClose} initialFocusRef={nameRef}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="ชื่อบริการ">
          <input ref={nameRef} value={name} onChange={(e) => { setName(e.target.value); setError('') }} maxLength={40} placeholder="เช่น Netflix, Spotify" className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="ราคา (บาท)">
            <input inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d.,]/g, '')); setError('') }} placeholder="0.00" className={`num ${inputClass}`} />
          </Field>
          <Field label="ตัดเงินครั้งถัดไป">
            <input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value || todayISO())} className={`num ${inputClass}`} />
          </Field>
        </div>

        <Segmented label="รอบการชำระ" value={cycle} onChange={setCycle} options={Object.entries(CYCLES).map(([id, c]) => ({ id, label: c.label }))} />

        <PaymentPicker cards={cards} value={cardId} onChange={setCardId} />

        <fieldset>
          <legend className="text-sm font-medium text-muted">สี</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUB_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-label={`สี ${c}`} aria-pressed={color === c} className={`size-9 rounded-full ring-offset-2 transition ${color === c ? 'ring-2 ring-ink' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </fieldset>

        <p className="rounded-xl bg-canvas px-3 py-2.5 text-xs text-muted">
          เมื่อถึงวันตัดเงิน แอปจะบันทึกเป็นรายจ่ายหมวด “บริการรายเดือน” ให้อัตโนมัติ{cardId ? ' และนับรวมในยอดบัตรเครดิต' : ''}
        </p>

        {error && <p role="alert" className="text-sm text-expense-strong">{error}</p>}

        <div className="flex gap-3">
          {editing && (
            <button type="button" onClick={onDelete} className="h-12 rounded-2xl px-4 text-sm font-semibold text-expense-strong ring-1 ring-line hover:bg-expense-soft">
              ลบ
            </button>
          )}
          <button type="submit" className="h-12 flex-1 rounded-2xl bg-ink text-base font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.99]">
            {editing ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
