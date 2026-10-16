import {
  Utensils, Coffee, Car, ShoppingBag, Receipt, HeartPulse, Gamepad2, Ellipsis,
  Briefcase, Laptop, Gift, TrendingUp, Repeat,
} from 'lucide-react'

export const CATEGORIES = {
  expense: [
    { id: 'food', label: 'อาหาร', icon: Utensils, color: '#F59E0B' },
    { id: 'coffee', label: 'กาแฟ', icon: Coffee, color: '#92400E' },
    { id: 'transport', label: 'เดินทาง', icon: Car, color: '#3B82F6' },
    { id: 'shopping', label: 'ช้อปปิ้ง', icon: ShoppingBag, color: '#EC4899' },
    { id: 'bills', label: 'ค่าบิล', icon: Receipt, color: '#8B5CF6' },
    { id: 'health', label: 'สุขภาพ', icon: HeartPulse, color: '#06B6D4' },
    { id: 'fun', label: 'บันเทิง', icon: Gamepad2, color: '#F97316' },
    { id: 'subscription', label: 'บริการรายเดือน', icon: Repeat, color: '#6366F1' },
    { id: 'other-expense', label: 'อื่นๆ', icon: Ellipsis, color: '#94A3B8' },
  ],
  income: [
    { id: 'salary', label: 'เงินเดือน', icon: Briefcase, color: '#10B981' },
    { id: 'freelance', label: 'ฟรีแลนซ์', icon: Laptop, color: '#0EA5E9' },
    { id: 'bonus', label: 'โบนัส', icon: Gift, color: '#F59E0B' },
    { id: 'invest', label: 'ลงทุน', icon: TrendingUp, color: '#6366F1' },
    { id: 'other-income', label: 'อื่นๆ', icon: Ellipsis, color: '#94A3B8' },
  ],
}

const BY_ID = Object.fromEntries(
  [...CATEGORIES.expense, ...CATEGORIES.income].map((c) => [c.id, c]),
)

export const getCategory = (id) => BY_ID[id] ?? CATEGORIES.expense.at(-1)
