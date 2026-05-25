'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

interface CategoryBreakdown {
  category: string
  total: number
  percentage: number
  count: number
}

interface DailyBreakdown {
  date: string
  dayName: string
  expense: number
  income: number
}

interface MonthlyComparison {
  month: string
  monthLabel: string
  expense: number
  income: number
  isCurrent: boolean
}

export function useWeeklySummary() {
  const [data, setData] = useState<{
    totalExpense: number
    totalIncome: number
    netBalance: number
    daily: DailyBreakdown[]
  }>({ totalExpense: 0, totalIncome: 0, netBalance: 0, daily: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const now = new Date()
      const weekStart = startOfWeek(now, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

      const { data: transactions } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))

      let totalExpense = 0
      let totalIncome = 0

      const dailyMap: Record<string, { expense: number; income: number }> = {}
      days.forEach(d => {
        dailyMap[format(d, 'yyyy-MM-dd')] = { expense: 0, income: 0 }
      })

      transactions?.forEach(t => {
        const amount = Number(t.amount)
        if (t.type === 'expense') {
          totalExpense += amount
          if (dailyMap[t.date]) dailyMap[t.date].expense += amount
        } else {
          totalIncome += amount
          if (dailyMap[t.date]) dailyMap[t.date].income += amount
        }
      })

      const daily = days.map(d => {
        const key = format(d, 'yyyy-MM-dd')
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
        return {
          date: key,
          dayName: dayNames[d.getDay()],
          expense: dailyMap[key]?.expense || 0,
          income: dailyMap[key]?.income || 0,
        }
      })

      setData({
        totalExpense,
        totalIncome,
        netBalance: totalIncome - totalExpense,
        daily,
      })
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { data, loading }
}

export function useMonthlySummary() {
  const [data, setData] = useState<{
    totalExpense: number
    totalIncome: number
    netSavings: number
    categories: CategoryBreakdown[]
  }>({ totalExpense: 0, totalIncome: 0, netSavings: 0, categories: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const now = new Date()
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, category')
        .gte('date', monthStart)
        .lte('date', monthEnd)

      let totalExpense = 0
      let totalIncome = 0
      const categoryMap: Record<string, { total: number; count: number }> = {}

      transactions?.forEach(t => {
        const amount = Number(t.amount)
        if (t.type === 'expense') {
          totalExpense += amount
          if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, count: 0 }
          categoryMap[t.category].total += amount
          categoryMap[t.category].count += 1
        } else {
          totalIncome += amount
        }
      })

      const categories = Object.entries(categoryMap)
        .map(([category, { total, count }]) => ({
          category,
          total,
          count,
          percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total)

      setData({ totalExpense, totalIncome, netSavings: totalIncome - totalExpense, categories })
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { data, loading }
}

export function useMonthlyComparison() {
  const [data, setData] = useState<MonthlyComparison[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const now = new Date()
      const start = subMonths(startOfMonth(now), 11)

      const { data: transactions } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .gte('date', format(start, 'yyyy-MM-dd'))

      const monthlyMap: Record<string, { expense: number; income: number }> = {}

      for (let i = 0; i < 12; i++) {
        const d = subMonths(now, 11 - i)
        const key = format(d, 'yyyy-MM')
        monthlyMap[key] = { expense: 0, income: 0 }
      }

      transactions?.forEach(t => {
        const key = t.date.substring(0, 7)
        if (monthlyMap[key]) {
          const amount = Number(t.amount)
          if (t.type === 'expense') {
            monthlyMap[key].expense += amount
          } else {
            monthlyMap[key].income += amount
          }
        }
      })

      const currentMonth = format(now, 'yyyy-MM')
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

      const result = Object.entries(monthlyMap).map(([month, vals]) => ({
        month,
        monthLabel: monthLabels[parseInt(month.split('-')[1]) - 1],
        ...vals,
        isCurrent: month === currentMonth,
      }))

      setData(result)
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { data, loading }
}

export function useTopExpenses(monthFilter?: string) {
  const [data, setData] = useState<Array<{
    id: string
    description: string
    category: string
    amount: number
    date: string
    payment_method: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('transactions')
        .select('id, description, category, amount, date, payment_method')
        .eq('type', 'expense')
        .order('amount', { ascending: false })
        .limit(5)

      if (monthFilter && monthFilter !== 'all') {
        const [year, month] = monthFilter.split('-')
        const start = `${year}-${month}-01`
        const endDate = new Date(parseInt(year), parseInt(month), 0)
        const end = format(endDate, 'yyyy-MM-dd')
        query = query.gte('date', start).lte('date', end)
      }

      const { data: result } = await query

      setData(result?.map(r => ({ ...r, amount: Number(r.amount) })) || [])
      setLoading(false)
    }
    fetch()
  }, [supabase, monthFilter])

  return { data, loading }
}
