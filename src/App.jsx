import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import AddTransactionModal from './components/AddTransactionModal'
import SubscriptionModal from './components/SubscriptionModal'
import CardModal from './components/CardModal'
import Toast from './components/Toast'
import { upcomingPayments } from './components/UpcomingPayments'
import HomeView from './views/HomeView'
import ReportView from './views/ReportView'
import SubscriptionsView from './views/SubscriptionsView'
import CardsView from './views/CardsView'
import SettingsView from './views/SettingsView'
import { useStore } from './hooks/useStore'
import { byCategory, inPeriod, monthlyTrend, sumTotals } from './lib/stats'
import { monthlyCost, pendingCharges } from './lib/subscriptions'
import { cardStatus } from './lib/cards'
import { exportCsv } from './lib/exportCsv'
import { todayISO } from './lib/format'

const isTyping = (el) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable

// Re-evaluates "today" when the app comes back to the foreground (PWAs stay alive for days).
function useToday() {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const refresh = () => setToday(todayISO())
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return today
}

export default function App() {
  const store = useStore()
  const { transactions, subscriptions, cards } = store
  const today = useToday()
  const [view, setView] = useState('home')
  const [period, setPeriod] = useState('month')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [modal, setModal] = useState(null) // { kind: 'tx' | 'sub' | 'card', data? }
  const [toast, setToast] = useState(null)

  // Record subscription charges that came due (including any missed while the app was closed).
  const { addSubscriptionCharges, markCharged } = store
  useEffect(() => {
    const charges = []
    const lastById = {}
    for (const s of subscriptions) {
      const dates = pendingCharges(s, today)
      if (!dates.length) continue
      lastById[s.id] = dates.at(-1)
      for (const date of dates) {
        charges.push({ type: 'expense', category: 'subscription', amount: s.amount, date, note: s.name, subscriptionId: s.id, cardId: s.cardId ?? null })
      }
    }
    if (!charges.length) return
    addSubscriptionCharges(charges)
    markCharged(lastById)
  }, [subscriptions, today, addSubscriptionCharges, markCharged])

  const periodItems = useMemo(() => transactions.filter((t) => inPeriod(t.date, period)), [transactions, period, today]) // eslint-disable-line react-hooks/exhaustive-deps
  const totals = useMemo(() => sumTotals(periodItems), [periodItems])
  const categories = useMemo(() => byCategory(periodItems), [periodItems])
  const trend = useMemo(() => monthlyTrend(transactions), [transactions])
  const upcoming = useMemo(() => upcomingPayments(subscriptions, cards, transactions), [subscriptions, cards, transactions, today]) // eslint-disable-line react-hooks/exhaustive-deps
  const subsPerMonth = useMemo(() => subscriptions.filter((s) => s.active).reduce((a, s) => a + monthlyCost(s), 0), [subscriptions])
  const cardOutstanding = useMemo(() => cards.reduce((a, c) => a + cardStatus(c, transactions).outstanding, 0), [cards, transactions])

  const notify = (message, action) => setToast({ id: Date.now(), message, action })
  const dismissToast = useCallback(() => setToast(null), [])
  const closeModal = () => setModal(null)
  const openAdd = () => setModal({ kind: 'tx' })

  const navigate = (v) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }

  // Desktop shortcut: N opens quick add.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey || modal || isTyping(e.target)) return
      e.preventDefault()
      setModal({ kind: 'tx' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  const handleAdd = (tx) => {
    store.addTransaction(tx)
    closeModal()
    notify(`บันทึก${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}แล้ว`)
  }

  const handleDelete = (tx) => {
    store.removeTransaction(tx.id)
    notify('ลบรายการแล้ว', () => store.restoreTransaction(tx))
  }

  const handleSaveSub = (sub) => {
    store.saveSubscription(sub)
    closeModal()
    notify(sub.id ? 'บันทึกการแก้ไขแล้ว' : `เพิ่ม ${sub.name} แล้ว`)
  }

  const handleDeleteSub = (sub) => {
    if (!window.confirm(`ลบ ${sub.name}? รายจ่ายที่บันทึกไปแล้วจะยังอยู่`)) return
    store.removeSubscription(sub.id)
    closeModal()
    notify('ลบบริการแล้ว')
  }

  const handleSaveCard = (card) => {
    store.saveCard(card)
    closeModal()
    notify(card.id ? 'บันทึกการแก้ไขแล้ว' : `เพิ่ม ${card.name} แล้ว`)
  }

  const handleDeleteCard = (card) => {
    if (!window.confirm(`ลบ ${card.name}? รายจ่ายเดิมจะยังอยู่ แต่ไม่ผูกกับบัตรนี้อีก`)) return
    store.removeCard(card.id)
    closeModal()
    notify('ลบบัตรแล้ว')
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
            onExport={() => exportCsv(transactions, cards)}
            subsPerMonth={subsPerMonth}
            cardOutstanding={cardOutstanding}
          />
        )}
        <main id="main" className="min-w-0 flex-1">
          {view === 'home' && (
            <HomeView
              items={periodItems}
              cards={cards}
              upcoming={upcoming}
              onOpen={(kind) => navigate(kind === 'card' ? 'cards' : 'subscriptions')}
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
          {view === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              cards={cards}
              onAdd={() => setModal({ kind: 'sub' })}
              onEdit={(s) => setModal({ kind: 'sub', data: s })}
              onToggle={store.toggleSubscription}
            />
          )}
          {view === 'cards' && (
            <CardsView
              cards={cards}
              transactions={transactions}
              subscriptions={subscriptions}
              onAdd={() => setModal({ kind: 'card' })}
              onEdit={(c) => setModal({ kind: 'card', data: c })}
              onSetPaid={(cardId, closeDate, paid) => {
                store.setStatementPaid(cardId, closeDate, paid)
                if (paid) notify('บันทึกว่าชำระแล้ว', () => store.setStatementPaid(cardId, closeDate, false))
              }}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              count={transactions.length}
              subCount={subscriptions.length}
              cardCount={cards.length}
              onExport={() => exportCsv(transactions, cards)}
              onLoadSample={() => {
                if (window.confirm('แทนที่ข้อมูลปัจจุบันด้วยข้อมูลตัวอย่าง?')) {
                  store.loadSample()
                  notify('โหลดข้อมูลตัวอย่างแล้ว')
                }
              }}
              onClear={() => {
                if (window.confirm('ลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                  store.clearAll()
                  notify('ล้างข้อมูลแล้ว')
                }
              }}
            />
          )}
        </main>
      </div>

      <BottomNav view={view} onNavigate={navigate} onAdd={openAdd} />
      {modal?.kind === 'tx' && <AddTransactionModal cards={cards} onClose={closeModal} onSubmit={handleAdd} />}
      {modal?.kind === 'sub' && (
        <SubscriptionModal initial={modal.data} cards={cards} onClose={closeModal} onSubmit={handleSaveSub} onDelete={() => handleDeleteSub(modal.data)} />
      )}
      {modal?.kind === 'card' && (
        <CardModal initial={modal.data} onClose={closeModal} onSubmit={handleSaveCard} onDelete={() => handleDeleteCard(modal.data)} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
