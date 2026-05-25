'use client'

import { useDashboardStats } from '@/hooks/useTransactions'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatDate, getCategoryInfo, cn } from '@/lib/utils'
import CategoryIcon from '@/components/ui/CategoryIcon'
import Link from 'next/link'
import {
  Wallet,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from 'lucide-react'

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { transactions: recentTx, loading: txLoading } = useTransactions({
    limit: 10,
    orderBy: 'created_at',
    orderDir: 'desc',
  })

  const statCards = [
    {
      label: 'Pengeluaran Hari Ini',
      value: stats.todayExpense,
      icon: Wallet,
      iconBg: 'rgba(239,68,68,0.1)',
      iconBorder: 'rgba(239,68,68,0.2)',
      iconColor: '#ef4444',
    },
    {
      label: 'Minggu Ini',
      value: stats.weekExpense,
      icon: CalendarDays,
      iconBg: 'rgba(59,130,246,0.1)',
      iconBorder: 'rgba(59,130,246,0.2)',
      iconColor: '#3b82f6',
    },
    {
      label: 'Bulan Ini',
      value: stats.monthExpense,
      icon: CalendarRange,
      iconBg: 'rgba(139,92,246,0.1)',
      iconBorder: 'rgba(139,92,246,0.2)',
      iconColor: '#8b5cf6',
    },
    {
      label: 'Saldo Bulan Ini',
      value: stats.balance,
      icon: TrendingUp,
      iconBg: 'rgba(16,185,129,0.1)',
      iconBorder: 'rgba(16,185,129,0.2)',
      iconColor: '#10b981',
    },
  ]

  return (
    <div className="page-enter space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Halo, Selamat Datang <span className="inline-block animate-bounce-slow">👋</span>
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Ringkasan keuangan Anda untuk periode ini.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/5 py-2 px-4 rounded-full border border-white/10 text-sm font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className={`glass-card p-4 md:p-6 slide-up group hover:scale-[1.01] transition-all duration-300`}
              style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12"
                  style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}
                >
                  <Icon size={20} color={card.iconColor} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--color-text-muted)' }}>
                    {card.label}
                  </p>
                  {statsLoading ? (
                    <div className="skeleton h-6 w-24 mt-1" />
                  ) : (
                    <p
                      className="text-lg md:text-xl font-black mt-1"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: card.value < 0 && card.label === 'Saldo Bulan Ini' ? 'var(--color-accent-red)' : 'var(--color-text-primary)',
                      }}
                    >
                      {formatCurrency(Math.abs(card.value))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Income vs Expense Summary */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="glass-card p-6 md:p-8 flex-1">
            <h2 className="text-base font-black mb-6 flex items-center gap-2 uppercase tracking-widest opacity-70">
              <div className="w-1 h-5 bg-primary rounded-full"></div>
              Ringkasan
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Pemasukan</span>
                </div>
                {statsLoading ? (
                  <div className="skeleton h-6 w-24" />
                ) : (
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-green)' }}>
                    {formatCurrency(stats.monthIncome)}
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft size={14} className="text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Pengeluaran</span>
                </div>
                {statsLoading ? (
                  <div className="skeleton h-6 w-24" />
                ) : (
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-red)' }}>
                    {formatCurrency(stats.monthExpense)}
                  </p>
                )}
              </div>
            </div>

            <Link href="/analytics" className="btn-ghost mt-6 w-full text-xs font-bold py-3 rounded-xl border-white/5">
              Lihat Laporan Lengkap
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-widest opacity-70">
                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                Transaksi Terkini
              </h2>
              <Link
                href="/transactions"
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-primary-light"
              >
                Semua
              </Link>
            </div>

            {txLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                    <div className="skeleton w-10 h-10 rounded-xl" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-32 mb-1" />
                      <div className="skeleton h-2 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTx.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-4">Tidak ada data</p>
                <Link href="/add" className="btn-primary text-xs py-2 px-4">
                  <Plus size={14} />
                  <span>Tambah</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTx.map((tx) => {
                  const catInfo = getCategoryInfo(tx.category)
                  return (
                    <Link
                      key={tx.id}
                      href="/transactions"
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 group border border-transparent active:scale-[0.98]"
                    >
                      <div className="relative flex-shrink-0 scale-90">
                        <CategoryIcon category={tx.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-bold truncate group-hover:text-primary-light transition-colors">
                          {tx.description}
                        </p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter mt-0.5">
                          {catInfo.label} • {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-sm md:text-base font-black tracking-tighter"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: tx.type === 'income' ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                          }}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <div className="mt-0.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            tx.payment_method === 'cash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {tx.payment_method}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
