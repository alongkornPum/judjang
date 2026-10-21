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

export default function SettingsView({ count, subCount, cardCount, instCount, onExport, onLoadSample, onClear }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-canvas text-ink">
            <Database className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">ข้อมูลในเครื่องนี้</p>
            <p className="text-sm text-muted">
              <span className="whitespace-nowrap"><span className="num">{count.toLocaleString('th-TH')}</span> รายการ</span> · <span className="whitespace-nowrap">บริการ <span className="num">{subCount}</span></span> · <span className="whitespace-nowrap">บัตร <span className="num">{cardCount}</span></span> · <span className="whitespace-nowrap">ผ่อน <span className="num">{instCount}</span></span>
            </p>
          </div>
        </div>
      </section>

      <section aria-label="จัดการข้อมูล" className="divide-y divide-line overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
        <Action icon={FileSpreadsheet} title="ส่งออก Excel (.csv)" description="ดาวน์โหลดรายการทั้งหมด เปิดได้ด้วย Excel / Google Sheets" onClick={onExport} />
        <Action icon={RotateCcw} title="โหลดข้อมูลตัวอย่าง" description="แทนที่ข้อมูลปัจจุบันด้วยข้อมูลตัวอย่าง 6 เดือน พร้อมบริการ บัตร และรายการผ่อนตัวอย่าง" onClick={onLoadSample} />
        <Action icon={Trash2} title="ล้างข้อมูลทั้งหมด" description="ลบรายการ บริการรายเดือน บัตร และรายการผ่อนทั้งหมดออกจากเครื่องนี้ กู้คืนไม่ได้" onClick={onClear} danger />
      </section>
    </div>
  )
}
