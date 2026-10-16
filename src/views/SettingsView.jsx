import { Database, FileSpreadsheet, RotateCcw, Trash2 } from 'lucide-react'

function Action({ icon: Icon, title, description, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-canvas lg:px-5"
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${danger ? 'bg-expense-soft text-expense-strong' : 'bg-canvas text-ink'}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className={`block font-medium ${danger ? 'text-expense-strong' : ''}`}>{title}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
    </button>
  )
}

export default function SettingsView({ count, onExport, onLoadSample, onClear }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-income to-sky-500 text-lg font-semibold text-white">J</span>
          <div>
            <p className="font-semibold">บัญชีของฉัน</p>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Database className="size-3.5" aria-hidden /> เก็บในเบราว์เซอร์นี้ · <span className="num">{count.toLocaleString('th-TH')}</span> รายการ
            </p>
          </div>
        </div>
      </section>

      <section aria-label="จัดการข้อมูล" className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
        <Action icon={FileSpreadsheet} title="ส่งออก Excel (.csv)" description="ดาวน์โหลดรายการทั้งหมด เปิดได้ด้วย Excel / Google Sheets" onClick={onExport} />
        <Action icon={RotateCcw} title="โหลดข้อมูลตัวอย่าง" description="แทนที่ข้อมูลปัจจุบันด้วยข้อมูลตัวอย่าง 6 เดือน" onClick={onLoadSample} />
        <Action icon={Trash2} title="ล้างข้อมูลทั้งหมด" description="ลบทุกรายการออกจากเครื่องนี้ ไม่สามารถกู้คืนได้" onClick={onClear} danger />
      </section>
    </div>
  )
}
