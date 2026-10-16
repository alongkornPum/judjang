import PeriodTabs from '../components/PeriodTabs'
import SummaryCards from '../components/SummaryCards'
import TransactionList from '../components/TransactionList'
import { CategoryDonut, TrendChart } from '../components/Charts'
import UpcomingPayments from '../components/UpcomingPayments'

export default function HomeView({ items, cards, upcoming, onOpen, totals, period, onPeriod, categories, categoryFilter, onCategory, onDelete, onAdd, trend }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="hidden text-2xl font-bold tracking-tight lg:block">ภาพรวม</h1>
        <PeriodTabs value={period} onChange={onPeriod} />
      </div>

      <SummaryCards totals={totals} period={period} />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Analytics are desktop-only on Home; mobile has them under "สรุป". */}
        <div className="hidden space-y-5 lg:col-span-3 lg:block">
          <TrendChart data={trend} />
          <CategoryDonut data={categories} selected={categoryFilter} onSelect={onCategory} />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <UpcomingPayments items={upcoming} onOpen={onOpen} />
          <TransactionList
            cards={cards}
            key={period}
            items={items}
            categoryFilter={categoryFilter}
            onClearCategory={() => onCategory(null)}
            onDelete={onDelete}
            onAdd={onAdd}
          />
        </div>
      </div>
    </div>
  )
}
