import { House, ChartPie, Settings, Plus, Wallet } from 'lucide-react'

export const NAV = [
  { id: 'home', label: 'หน้าแรก', icon: House },
  { id: 'report', label: 'รายงานสรุป', icon: ChartPie },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
]

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
        <Wallet className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight">
        JuD<span className="text-income-strong">J</span>anG
      </span>
    </span>
  )
}

export default function Header({ view, onNavigate, onAdd }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 lg:px-6">
        <button type="button" onClick={() => onNavigate('home')} className="rounded-xl" aria-label="JuDJanG หน้าแรก">
          <Logo />
        </button>

        <nav aria-label="เมนูหลัก" className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors ${
                view === id ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:bg-white/70 hover:text-ink'
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onAdd}
            className="hidden h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 active:scale-[0.98] lg:flex"
          >
            <Plus className="size-4" aria-hidden />
            เพิ่มรายการ
            <kbd className="num ml-1 rounded-md bg-white/15 px-1.5 text-[11px] font-medium">N</kbd>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="grid size-11 place-items-center rounded-full"
            aria-label="โปรไฟล์และการตั้งค่า"
          >
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-income to-sky-500 text-sm font-semibold text-white">
              J
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
