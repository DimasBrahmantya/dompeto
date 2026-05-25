'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/lib/utils'

export function useTransactions(filters?: {
  dateFrom?: string
  dateTo?: string
  category?: string
  paymentMethod?: string
  type?: string
  search?: string
  limit?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*')
      .order(filters?.orderBy || 'date', { ascending: filters?.orderDir === 'asc' })
      .order('created_at', { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo)
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      query = query.eq('payment_method', filters.paymentMethod)
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }
    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [supabase, filters?.dateFrom, filters?.dateTo, filters?.category, filters?.paymentMethod, filters?.type, filters?.search, filters?.limit, filters?.orderBy, filters?.orderDir])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setTransactions(prev => [data, ...prev])
    return data
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    todayExpense: 0,
    weekExpense: 0,
    monthExpense: 0,
    monthIncome: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // Get start of week (Monday)
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - mondayOffset)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      // Get start of month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

      const { data } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .gte('date', monthStart)

      if (data) {
        let todayExp = 0, weekExp = 0, monthExp = 0, monthInc = 0

        data.forEach((t) => {
          if (t.type === 'expense') {
            monthExp += Number(t.amount)
            if (t.date === today) todayExp += Number(t.amount)
            if (t.date >= weekStartStr) weekExp += Number(t.amount)
          } else {
            monthInc += Number(t.amount)
          }
        })

        setStats({
          todayExpense: todayExp,
          weekExpense: weekExp,
          monthExpense: monthExp,
          monthIncome: monthInc,
          balance: monthInc - monthExp,
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [supabase])

  return { stats, loading }
}
