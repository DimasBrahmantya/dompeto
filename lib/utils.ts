import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, eachMonthOfInterval } from 'date-fns'
import { id as localeID } from 'date-fns/locale'

// Currency formatting - IDR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Short currency (e.g., Rp 1,2jt)
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`
  }
  return formatCurrency(amount)
}

// Date formatting
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: localeID })
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'dd/MM', { locale: localeID })
}

export function formatDay(date: string | Date): string {
  return format(new Date(date), 'EEEE', { locale: localeID })
}

export function formatMonthYear(date: string | Date): string {
  return format(new Date(date), 'MMMM yyyy', { locale: localeID })
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm')
}

// Date range helpers
export function getWeekRange(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function getLast12Months() {
  const now = new Date()
  return eachMonthOfInterval({
    start: subMonths(startOfMonth(now), 11),
    end: startOfMonth(now),
  })
}

export function getDaysInWeek(date: Date = new Date()) {
  const { start, end } = getWeekRange(date)
  return eachDayOfInterval({ start, end })
}

// Category helpers
export const CATEGORIES = [
  { value: 'food', label: 'Makanan & Minuman', icon: 'UtensilsCrossed', color: '#f97316' },
  { value: 'transport', label: 'Transportasi', icon: 'Car', color: '#3b82f6' },
  { value: 'shopping', label: 'Belanja', icon: 'ShoppingBag', color: '#ec4899' },
  { value: 'bills', label: 'Tagihan & Utilitas', icon: 'Receipt', color: '#8b5cf6' },
  { value: 'health', label: 'Kesehatan', icon: 'Heart', color: '#ef4444' },
  { value: 'entertainment', label: 'Hiburan', icon: 'Gamepad2', color: '#14b8a6' },
  { value: 'education', label: 'Pendidikan', icon: 'GraduationCap', color: '#6366f1' },
  { value: 'other', label: 'Lainnya', icon: 'MoreHorizontal', color: '#6b7280' },
] as const

export function getCategoryInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
}

// Transaction type
export interface Transaction {
  id: string
  user_id: string
  date: string
  description: string
  category: string
  amount: number
  payment_method: 'cash' | 'debit'
  type: 'income' | 'expense'
  created_at: string
  updated_at: string
}

// cn helper for class merging
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
