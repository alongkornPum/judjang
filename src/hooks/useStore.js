import { useCallback, useEffect, useState } from 'react'
import { byNewest, createSampleData } from '../data/sample'
import { lastBillingBefore } from '../lib/subscriptions'
import { todayISO } from '../lib/format'

const KEYS = {
  transactions: 'judjang:transactions:v1',
  subscriptions: 'judjang:subscriptions:v1',
  cards: 'judjang:cards:v1',
}

// Only a brand-new install gets sample subscriptions/cards; existing users
// who already have transactions start with empty lists.
const isFreshInstall = (() => {
  try {
    return localStorage.getItem(KEYS.transactions) === null
  } catch {
    return true
  }
})()

let sample
const getSample = () => (sample ??= createSampleData())

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {
      // storage unavailable: use fallback
    }
    return fallback()
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // private mode / quota: keep working in memory
    }
  }, [key, value])
  return [value, setValue]
}

// crypto.randomUUID needs a secure context, which a file opened from a phone may not be.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const upsert = (list, item) =>
  item.id && list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? { ...x, ...item } : x)) : [...list, { ...item, id: newId() }]

export function useStore() {
  const [transactions, setTransactions] = usePersistentState(KEYS.transactions, () => getSample().transactions)
  const [subscriptions, setSubscriptions] = usePersistentState(KEYS.subscriptions, () => (isFreshInstall ? getSample().subscriptions : []))
  const [cards, setCards] = usePersistentState(KEYS.cards, () => (isFreshInstall ? getSample().cards : []))

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => [{ ...tx, id: newId(), createdAt: Date.now() }, ...prev].sort(byNewest))
  }, [setTransactions])

  // Idempotent per (subscription, date) so a re-run of the sync never double-charges.
  const addSubscriptionCharges = useCallback((charges) => {
    setTransactions((prev) => {
      const seen = new Set(prev.filter((t) => t.subscriptionId).map((t) => `${t.subscriptionId}|${t.date}`))
      const fresh = charges.filter((c) => !seen.has(`${c.subscriptionId}|${c.date}`))
      if (!fresh.length) return prev
      const now = Date.now()
      return [...fresh.map((c, i) => ({ ...c, id: newId(), createdAt: now + i })), ...prev].sort(byNewest)
    })
  }, [setTransactions])

  const removeTransaction = useCallback((id) => setTransactions((prev) => prev.filter((t) => t.id !== id)), [setTransactions])
  const restoreTransaction = useCallback((tx) => setTransactions((prev) => [tx, ...prev].sort(byNewest)), [setTransactions])

  const saveSubscription = useCallback((sub) => setSubscriptions((prev) => upsert(prev, sub)), [setSubscriptions])
  const removeSubscription = useCallback((id) => setSubscriptions((prev) => prev.filter((s) => s.id !== id)), [setSubscriptions])
  const markCharged = useCallback((lastById) => {
    setSubscriptions((prev) => prev.map((s) => (lastById[s.id] && (!s.lastChargedDate || lastById[s.id] > s.lastChargedDate) ? { ...s, lastChargedDate: lastById[s.id] } : s)))
  }, [setSubscriptions])
  const toggleSubscription = useCallback((id) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        if (s.active) return { ...s, active: false }
        const skipTo = lastBillingBefore(s, todayISO())
        return { ...s, active: true, lastChargedDate: skipTo && (!s.lastChargedDate || skipTo > s.lastChargedDate) ? skipTo : s.lastChargedDate }
      }),
    )
  }, [setSubscriptions])

  const saveCard = useCallback((card) => setCards((prev) => upsert(prev, { paidStatements: [], ...card })), [setCards])
  const removeCard = useCallback((id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    setSubscriptions((prev) => prev.map((s) => (s.cardId === id ? { ...s, cardId: null } : s)))
  }, [setCards, setSubscriptions])
  const setStatementPaid = useCallback((cardId, closeDate, paid) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c
        const rest = (c.paidStatements ?? []).filter((d) => d !== closeDate)
        return { ...c, paidStatements: paid ? [...rest, closeDate] : rest }
      }),
    )
  }, [setCards])

  const clearAll = useCallback(() => {
    setTransactions([])
    setSubscriptions([])
    setCards([])
  }, [setTransactions, setSubscriptions, setCards])
  const loadSample = useCallback(() => {
    const s = createSampleData()
    setTransactions(s.transactions)
    setSubscriptions(s.subscriptions)
    setCards(s.cards)
  }, [setTransactions, setSubscriptions, setCards])

  return {
    transactions, subscriptions, cards,
    addTransaction, addSubscriptionCharges, removeTransaction, restoreTransaction,
    saveSubscription, removeSubscription, toggleSubscription, markCharged,
    saveCard, removeCard, setStatementPaid,
    clearAll, loadSample,
  }
}
