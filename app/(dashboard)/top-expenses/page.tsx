'use client'

import { useState } from 'react'
import { useTopExpenses } from '@/hooks/useAnalytics'
import { formatCurrency, formatDate, getCategoryInfo, formatMonthYear } from '@/lib/utils'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { Trophy, Medal, Calendar } from 'lucide-react'
import { format, subMonths } from 'date-fns'

export default function TopExpensesPage() {
  const [monthFilter, setMonthFilter] = useState('all')
  const { data: expenses, loading } = useTopExpenses(monthFilter)

  // Generate last 12 months for filter
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i)
    return {
      value: format(d, 'yyyy-MM'),
      label: formatMonthYear(d),
    }
  })

  const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#64748b', '#64748b']
  const rankIcons = [Trophy, Medal, Medal]

  return (
    <div className="page-enter space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Top <span className="text-rose-500">Pengeluaran</span>
          </h1>
          <p className="text-sm font-medium opacity-60 mt-1">
            Analisis 5 pengeluaran terbesar untuk memantau efisiensi.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <Calendar size={18} className="ml-3 opacity-40" />
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer pr-10"
            id="month-filter"
            suppressHydrationWarning
          >
            <option value="all">Semua Waktu</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-6 flex items-center gap-5">
              <div className="skeleton w-12 h-12 rounded-2xl" />
              <div className="skeleton w-12 h-12 rounded-2xl" />
              <div className="flex-1">
                <div className="skeleton h-5 w-64 mb-2" />
                <div className="skeleton h-3 w-40" />
              </div>
              <div className="skeleton h-8 w-32 rounded-xl" />
            </div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="glass-card p-20 text-center bg-white/5 border-dashed">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy size={48} className="opacity-20" />
          </div>
          <h3 className="text-xl font-bold mb-2">Belum Ada Rekor Terdeteksi</h3>
          <p className="text-sm opacity-60 max-w-sm mx-auto">
            Mulailah mencatat transaksi Anda untuk melihat daftar pengeluaran terbesar di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense, index) => {
            const catInfo = getCategoryInfo(expense.category)
            const RankIcon = rankIcons[index] || Medal
            const isTop3 = index < 3
            
            return (
              <div
                key={expense.id}
                className={`glass-card group p-6 flex items-center gap-5 transition-all duration-500 overflow-hidden relative ${isTop3 ? 'border-primary/20 ring-1 ring-primary/5' : ''}`}
                style={{ 
                  animationDelay: `${index * 150}ms`, 
                  animationFillMode: 'backwards' 
                }}
              >
                {/* Glow Background for top spots */}
                {isTop3 && (
                  <div 
                    className="absolute -right-20 -top-20 w-40 h-40 blur-[100px] opacity-20 pointer-events-none"
                    style={{ background: rankColors[index] }}
                  />
                )}

                {/* Rank Number/Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500"
                  style={{
                    background: `${rankColors[index]}15`,
                    border: `1px solid ${rankColors[index]}30`,
                    boxShadow: isTop3 ? `0 8px 20px -8px ${rankColors[index]}44` : 'none'
                  }}
                >
                  {isTop3 ? (
                    <RankIcon size={24} color={rankColors[index]} />
                  ) : (
                    <span className="text-lg font-black" style={{ fontFamily: 'var(--font-mono)', color: rankColors[index] }}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Category Icon */}
                <CategoryIcon category={expense.category} />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-base md:text-lg font-black truncate group-hover:text-primary-light transition-colors">
                    {expense.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1 underline-offset-4 decoration-primary/20">
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                      {catInfo.label}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-xs font-bold opacity-40">
                      {formatDate(expense.date)}
                    </span>
                    <span className={`badge ${expense.payment_method === 'cash' ? 'badge-cash' : 'badge-debit'}`}>
                      {expense.payment_method}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-xl md:text-2xl font-black tracking-tighter"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent-red)',
                    }}
                  >
                    {formatCurrency(expense.amount)}
                  </p>
                  <div className="text-[10px] font-black opacity-20 uppercase tracking-tighter mt-1">
                    Nilai Transaksi
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
