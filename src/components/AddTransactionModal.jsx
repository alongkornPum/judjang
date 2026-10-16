import { useRef, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { todayISO } from '../lib/format'
import Modal, { Field, PaymentPicker, Segmented, inputClass } from './Modal'

/*
 * Built for the 3-second entry goal: amount is autofocused with a numeric
 * keypad, a category is preselected, and Enter saves.
 */
export default function AddTransactionModal({ initialType = 'expense', cards, onClose, onSubmit }) {
  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[initialType][0].id)
  const [cardId, setCardId] = useState(null)
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const amountRef = useRef(null)

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
    onSubmit({
      type,
      amount: Math.round(value * 100) / 100,
      category,
      date: date || todayISO(),
      note: note.trim(),
      cardId: type === 'expense' ? cardId : null,
    })
  }

  const income = type === 'income'

  return (
    <Modal title="บันทึกรายการ" onClose={onClose} initialFocusRef={amountRef}>
      <form onSubmit={submit} className="mt-4 space-y-5">
        <Segmented
          label="ประเภทรายการ"
          value={type}
          onChange={switchType}
          options={[
            { id: 'expense', label: 'รายจ่าย', active: 'bg-expense-strong text-white' },
            { id: 'income', label: 'รายรับ', active: 'bg-income-strong text-white' },
          ]}
        />

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
                  className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center text-xs font-medium leading-tight ring-1 transition ${
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

        {!income && <PaymentPicker cards={cards} value={cardId} onChange={setCardId} />}

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Field label="วันที่">
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={`num ${inputClass}`} />
          </Field>
          <Field label="บันทึก" hint="ไม่บังคับ">
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder="เช่น ข้าวมันไก่" className={inputClass} />
          </Field>
        </div>

        <div className="sticky -bottom-5 -mx-5 bg-white/95 px-5 pb-1 pt-2 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          className={`h-13 w-full rounded-2xl text-base font-semibold text-white shadow-sm transition active:scale-[0.99] ${
            income ? 'bg-income-strong hover:bg-income-strong/90' : 'bg-expense-strong hover:bg-expense-strong/90'
          }`}
        >
          บันทึก{income ? 'รายรับ' : 'รายจ่าย'}
        </button>
        </div>
      </form>
    </Modal>
  )
}
