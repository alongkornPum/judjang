import { useRef, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { formatMoney, todayISO } from '../lib/format'
import { formatDateWithYear } from '../lib/dates'
import { MAX_INSTALLMENTS, installmentAmount, pendingInstallments, schedule } from '../lib/installments'
import Modal, { Field, PaymentPicker, Segmented, inputClass } from './Modal'

const COUNT_PRESETS = [3, 6, 10, 12, 24]
const EXPENSE_CATEGORIES = CATEGORIES.expense.filter((c) => c.id !== 'subscription')

export default function InstallmentModal({ initial, cards, onClose, onSubmit, onDelete }) {
  const editing = !!initial?.id
  // Once an installment is recorded the schedule is fixed, so past expenses stay consistent.
  const locked = editing && !!initial.lastChargedDate
  const [name, setName] = useState(initial?.name ?? '')
  const [mode, setMode] = useState('total')
  const [amount, setAmount] = useState(initial?.total ? String(initial.total) : '')
  const [count, setCount] = useState(String(initial?.count ?? 10))
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO())
  const [category, setCategory] = useState(initial?.category ?? 'shopping')
  const [cardId, setCardId] = useState(initial?.cardId ?? null)
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  const value = Number.parseFloat(amount.replaceAll(',', ''))
  const n = Number(count)
  const validCount = Number.isInteger(n) && n >= 2 && n <= MAX_INSTALLMENTS
  const total = Math.round((mode === 'total' ? value : value * n) * 100) / 100
  const preview = value > 0 && validCount ? { total, count: n, startDate } : null

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('กรุณาใส่ชื่อรายการ')
    if (!(value > 0)) return setError('กรุณากรอกจำนวนเงินมากกว่า 0')
    if (!validCount) return setError(`จำนวนงวดต้องอยู่ระหว่าง 2–${MAX_INSTALLMENTS}`)
    const base = { name: name.trim(), category, cardId }
    onSubmit(locked ? { ...initial, ...base } : { ...initial, ...base, total, count: n, startDate, lastChargedDate: null })
  }

  const edit = (setter) => (e) => {
    setter(e.target.value)
    setError('')
  }

  return (
    <Modal title={editing ? 'แก้ไขรายการผ่อน' : 'เพิ่มรายการผ่อนชำระ'} onClose={onClose} initialFocusRef={nameRef}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="ชื่อรายการ">
          <input ref={nameRef} value={name} onChange={edit(setName)} maxLength={40} placeholder="เช่น มือถือ, โน้ตบุ๊ก, ตู้เย็น" className={inputClass} />
        </Field>

        {!locked && (
          <Segmented label="กรอกยอดเป็น" value={mode} onChange={setMode} options={[{ id: 'total', label: 'ยอดรวม' }, { id: 'each', label: 'ยอดต่องวด' }]} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={mode === 'total' ? 'ยอดรวม (บาท)' : 'งวดละ (บาท)'}>
            <input inputMode="decimal" value={amount} disabled={locked} onChange={(e) => { setAmount(e.target.value.replace(/[^\d.,]/g, '')); setError('') }} placeholder="0.00" className={`num ${inputClass} disabled:opacity-60`} />
          </Field>
          <Field label="งวดแรก">
            <input type="date" value={startDate} disabled={locked} onChange={(e) => setStartDate(e.target.value || todayISO())} className={`num ${inputClass} disabled:opacity-60`} />
          </Field>
        </div>

        <fieldset disabled={locked} className="disabled:opacity-60">
          <legend className="text-sm font-medium text-muted">จำนวนงวด (เดือน)</legend>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {COUNT_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={n === c}
                onClick={() => { setCount(String(c)); setError('') }}
                className={`num h-10 min-w-12 rounded-full px-3.5 text-sm font-medium ring-1 transition ${n === c ? 'bg-ink/[0.04] text-ink ring-2 ring-ink' : 'text-muted ring-line hover:bg-canvas'}`}
              >
                {c}
              </button>
            ))}
            <input
              inputMode="numeric"
              aria-label="จำนวนงวดอื่นๆ"
              value={count}
              onChange={(e) => { setCount(e.target.value.replace(/\D/g, '').slice(0, 3)); setError('') }}
              className="num h-10 w-20 rounded-xl border border-line bg-canvas px-3 text-center text-sm focus:border-ink/40 focus:bg-white focus:outline-none"
            />
          </div>
        </fieldset>

        <Field label="หมวดหมู่">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>

        <PaymentPicker cards={cards} value={cardId} onChange={setCardId} />

        {preview && <Summary plan={preview} backfill={locked ? 0 : pendingInstallments(preview, todayISO()).length} />}

        {locked && <p className="text-xs text-muted">บันทึกงวดไปแล้ว จึงแก้ได้เฉพาะชื่อ หมวดหมู่ และวิธีชำระ</p>}

        {error && <p role="alert" className="text-sm text-expense-strong">{error}</p>}

        <div className="flex gap-3">
          {editing && (
            <button type="button" onClick={onDelete} className="h-12 rounded-2xl px-4 text-sm font-semibold text-expense-strong ring-1 ring-line hover:bg-expense-soft">
              ลบ
            </button>
          )}
          <button type="submit" className="h-12 flex-1 rounded-2xl bg-ink text-base font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.99]">
            {editing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการผ่อน'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Summary({ plan, backfill }) {
  const each = installmentAmount(plan, 0)
  const last = installmentAmount(plan, plan.count - 1)
  return (
    <div className="space-y-1 rounded-xl bg-canvas px-3 py-2.5 text-xs text-muted">
      <p>
        งวดละ <span className="num font-semibold text-ink">฿{formatMoney(each)}</span> × <span className="num">{plan.count}</span> งวด
        รวม <span className="num font-semibold text-ink">฿{formatMoney(plan.total)}</span>
        {last !== each && <> (งวดสุดท้าย <span className="num">฿{formatMoney(last)}</span>)</>}
      </p>
      <p>ผ่อนถึง {formatDateWithYear(schedule(plan).at(-1).date)} · แอปจะบันทึกรายจ่ายให้อัตโนมัติทุกงวด{backfill > 0 && ` · บันทึกย้อนหลัง ${backfill} งวด`}</p>
    </div>
  )
}
