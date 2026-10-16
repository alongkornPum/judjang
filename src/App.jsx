import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import AddTransactionModal from './components/AddTransactionModal'
import Toast from './components/Toast'
import HomeView from './views/HomeView'
import ReportView from './views/ReportView'
import SettingsView from './views/SettingsView'
import { useTransactions } from './hooks/useTransactions'
import { byCategory, inPeriod, monthlyTrend, sumTotals } from './lib/stats'
import { exportCsv } from './lib/exportCsv'

const isTyping = (el) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable

export default function App() {
  const { items, add, remove, restore, clear, loadSample } = useTransactions()
  const [view, setView] = useState('home')
  const [period, setPeriod] = useState('month')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [toast, setToast] = useState(null)

  const periodItems = useMemo(() => items.filter((t) => inPeriod(t.date, period)), [items, period])
  const totals = useMemo(() => sumTotals(periodItems), [periodItems])
  const categories = useMemo(() => byCategory(periodItems), [periodItems])
  const trend = useMemo(() => monthlyTrend(items), [items])

  const notify = (message, action) => setToast({ id: Date.now(), message, action })
  const dismissToast = useCallback(() => setToast(null), [])
  const openAdd = () => setModalType('expense')

  const navigate = (v) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }

  // Desktop shortcut: N opens quick add.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey || modalType || isTyping(e.target)) return
      e.preventDefault()
      setModalType('expense')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalType])

  const handleAdd = (tx) => {
    add(tx)
    setModalType(null)
    notify(`บันทึก${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}แล้ว`)
  }

  const handleDelete = (tx) => {
    remove(tx.id)
    notify('ลบรายการแล้ว', () => restore(tx))
  }

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        ข้ามไปยังเนื้อหา
      </a>
      <Header view={view} onNavigate={navigate} onAdd={openAdd} />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-32 pt-5 lg:px-6 lg:pb-10 lg:pt-6">
        {view === 'home' && (
          <Sidebar
            items={periodItems}
            totals={totals}
            period={period}
            categoryFilter={categoryFilter}
            onCategory={setCategoryFilter}
            onExport={() => exportCsv(items)}
          />
        )}
        <main id="main" className="min-w-0 flex-1">
          {view === 'home' && (
            <HomeView
              items={periodItems}
              totals={totals}
              period={period}
              onPeriod={setPeriod}
              categories={categories}
              categoryFilter={categoryFilter}
              onCategory={setCategoryFilter}
              onDelete={handleDelete}
              onAdd={openAdd}
              trend={trend}
            />
          )}
          {view === 'report' && <ReportView items={periodItems} totals={totals} period={period} onPeriod={setPeriod} trend={trend} />}
          {view === 'settings' && (
            <SettingsView
              count={items.length}
              onExport={() => exportCsv(items)}
              onLoadSample={() => {
                if (window.confirm('แทนที่ข้อมูลปัจจุบันด้วยข้อมูลตัวอย่าง?')) {
                  loadSample()
                  notify('โหลดข้อมูลตัวอย่างแล้ว')
                }
              }}
              onClear={() => {
                if (window.confirm('ลบรายการทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                  clear()
                  notify('ล้างข้อมูลแล้ว')
                }
              }}
            />
          )}
        </main>
      </div>

      <BottomNav view={view} onNavigate={navigate} onAdd={openAdd} />
      {modalType && <AddTransactionModal initialType={modalType} onClose={() => setModalType(null)} onSubmit={handleAdd} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
