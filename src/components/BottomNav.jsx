import { House, ChartPie, Plus, Repeat, CreditCard } from 'lucide-react'

function NavItem({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors ${
        active ? 'text-ink' : 'text-muted'
      }`}
    >
      <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
      {label}
    </button>
  )
}

// Mobile only: the primary action sits in the thumb zone, centred and raised.
export default function BottomNav({ view, onNavigate, onAdd }) {
  const item = (id, label, icon) => <NavItem active={view === id} label={label} icon={icon} onClick={() => onNavigate(id)} />
  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-2">
        {item('home', 'หน้าแรก', House)}
        {item('report', 'สรุป', ChartPie)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="บันทึกรายการใหม่"
            className="-mt-7 grid size-16 place-items-center rounded-full bg-ink text-white shadow-lg shadow-ink/25 ring-4 ring-canvas transition active:scale-95"
          >
            <Plus className="size-7" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
        {item('subscriptions', 'รายเดือน', Repeat)}
        {item('cards', 'บัตร', CreditCard)}
      </div>
    </nav>
  )
}
