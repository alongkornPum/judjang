import PeriodTabs from '../components/PeriodTabs'
import SummaryCards from '../components/SummaryCards'
import { CategoryDonut, TrendChart } from '../components/Charts'
import { byCategory } from '../lib/stats'

export default function ReportView({ items, totals, period, onPeriod, trend }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">รายงานสรุป</h1>
        <PeriodTabs value={period} onChange={onPeriod} />
      </div>
      <SummaryCards totals={totals} period={period} />
      <TrendChart data={trend} />
      <div className="grid gap-5 lg:grid-cols-2">
        <CategoryDonut data={byCategory(items, 'expense')} />
        <CategoryDonut data={byCategory(items, 'income')} title="สัดส่วนรายรับตามแหล่งที่มา" centerLabel="รายรับรวม" />
      </div>
    </div>
  )
}
