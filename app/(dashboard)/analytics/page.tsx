'use client'

import { useState } from 'react'
import { useWeeklySummary, useMonthlySummary, useMonthlyComparison } from '@/hooks/useAnalytics'
import { formatCurrency, getCategoryInfo, formatMonthYear } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarDays,
  CalendarRange,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'

export default function AnalyticsPage() {
  const { data: weekly, loading: weeklyLoading } = useWeeklySummary()
  const { data: monthly, loading: monthlyLoading } = useMonthlySummary()
  const { data: comparison, loading: comparisonLoading } = useMonthlyComparison()
  const [compFilter, setCompFilter] = useState<'all' | 'expense' | 'income'>('all')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-card p-3" style={{ minWidth: '150px' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: p.color || p.fill }}>
            {p.name}: {formatCurrency(Number(p.value))}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="page-enter space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Analisis <span className="text-primary-light">Keuangan</span>
        </h1>
        <p className="text-sm font-medium opacity-60 mt-1">
          Visualisasi tren dan rincian transaksi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Weekly Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 md:p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <h2 className="text-base md:text-lg font-bold tracking-tight uppercase tracking-widest opacity-70">
                Mingguan
              </h2>
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
                <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Keluar</p>
                {weeklyLoading ? <div className="skeleton h-5 w-full" /> : (
                  <p className="text-xs md:text-sm font-black truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-red)' }}>
                    {formatCurrency(weekly.totalExpense)}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Masuk</p>
                {weeklyLoading ? <div className="skeleton h-5 w-full" /> : (
                  <p className="text-xs md:text-sm font-black truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-green)' }}>
                    {formatCurrency(weekly.totalIncome)}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Saldo</p>
                {weeklyLoading ? <div className="skeleton h-5 w-full" /> : (
                  <p className="text-xs md:text-sm font-black truncate" style={{ fontFamily: 'var(--font-mono)', color: weekly.netBalance >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                    {formatCurrency(Math.abs(weekly.netBalance))}
                  </p>
                )}
              </div>
            </div>

            {/* Weekly Bar Chart */}
            {!weeklyLoading && (
              <div className="mt-auto" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly.daily} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="dayName" 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 md:p-8 h-full">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <PieChartIcon size={20} />
                </div>
                <h2 className="text-base md:text-lg font-bold tracking-tight uppercase tracking-widest opacity-70">
                  Kategori
                </h2>
              </div>
              <div className="px-2 py-1 bg-white/5 rounded text-[9px] font-black uppercase tracking-wider opacity-40">
                Bulan Ini
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
              {/* Pie Chart */}
              {!monthlyLoading && monthly.categories.length > 0 ? (
                <div style={{ height: 200 }} className="relative scale-90 md:scale-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthly.categories.map(c => ({
                          name: getCategoryInfo(c.category).label,
                          value: c.total,
                          color: getCategoryInfo(c.category).color,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {monthly.categories.map((c, i) => (
                          <Cell key={i} fill={getCategoryInfo(c.category).color} style={{ outline: 'none' }} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-black uppercase opacity-30 mt-2">Total</span>
                    <span className="text-sm font-black">{formatCurrency(monthly.totalExpense)}</span>
                  </div>
                </div>
              ) : !monthlyLoading && (
                <div className="h-[200px] flex items-center justify-center text-center opacity-40 uppercase text-[10px] font-black tracking-widest border border-dashed border-white/5 rounded-2xl md:rounded-3xl">
                  Kosong
                </div>
              )}

              {/* Progress Bars */}
              <div className="space-y-4">
                {monthlyLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="skeleton h-2 w-full" />
                    </div>
                  ))
                ) : monthly.categories.length === 0 ? (
                  <p className="text-[10px] font-bold opacity-30 text-center uppercase tracking-widest">Belum ada data</p>
                ) : (
                  monthly.categories.slice(0, 4).map((cat) => {
                    const info = getCategoryInfo(cat.category)
                    return (
                      <div key={cat.category} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold opacity-60 uppercase tracking-tight">
                            {info.label}
                          </span>
                          <span className="text-[10px] font-black" style={{ fontFamily: 'var(--font-mono)' }}>
                            {cat.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ width: `${cat.percentage}%`, background: info.color }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="glass-card p-5 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl md:rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight uppercase tracking-widest opacity-70">
                Tahunan
              </h2>
              <p className="text-[10px] font-medium opacity-40">Tren 12 bulan terakhir.</p>
            </div>
          </div>
          
          <div className="toggle-group p-1 bg-white/5 h-10 md:h-12 overflow-x-auto no-scrollbar whitespace-nowrap">
            {([['all', 'Semua'], ['expense', 'Keluar'], ['income', 'Masuk']] as const).map(([val, label]) => (
              <button
                key={val}
                className={`toggle-item px-4 md:px-5 h-full rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider ${compFilter === val ? 'active active-blue text-white' : 'opacity-40'}`}
                onClick={() => setCompFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {comparisonLoading ? (
          <div className="skeleton h-[250px] md:h-[350px] w-full" />
        ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} barGap={4} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                   tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700 }} 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                   width={35}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                {(compFilter === 'all' || compFilter === 'expense') && (
                  <Bar dataKey="expense" name="Keluar" fill="#ef4444" radius={[2, 2, 2, 2]} opacity={0.6} />
                )}
                {(compFilter === 'all' || compFilter === 'income') && (
                  <Bar dataKey="income" name="Masuk" fill="#10b981" radius={[2, 2, 2, 2]} opacity={0.6} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
