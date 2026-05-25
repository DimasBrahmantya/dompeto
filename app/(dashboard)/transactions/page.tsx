'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatDate, getCategoryInfo, CATEGORIES, Transaction } from '@/lib/utils'
import CategoryIcon from '@/components/ui/CategoryIcon'
import TransactionForm from '@/components/forms/TransactionForm'
import { useToast } from '@/components/layout/Toast'
import {
  Search,
  Filter,
  Download,
  Pencil,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
} from 'lucide-react'

export default function TransactionsPage() {
  const { showToast } = useToast()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [category, setCategory] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { transactions, loading, refetch, deleteTransaction } = useTransactions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    category,
    paymentMethod,
    type,
    search: search || undefined,
  })

  // Daily totals
  const dailyGroups = useMemo(() => {
    const groups: Record<string, { transactions: Transaction[]; totalIncome: number; totalExpense: number }> = {}
    transactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = { transactions: [], totalIncome: 0, totalExpense: 0 }
      }
      groups[tx.date].transactions.push(tx)
      if (tx.type === 'income') groups[tx.date].totalIncome += tx.amount
      else groups[tx.date].totalExpense += tx.amount
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [transactions])

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      showToast('Transaksi berhasil dihapus', 'success')
      setDeletingId(null)
    } catch {
      showToast('Gagal menghapus transaksi', 'error')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Nominal', 'Tipe', 'Metode Pembayaran']
    const rows = transactions.map(tx => [
      tx.date,
      tx.description,
      getCategoryInfo(tx.category).label,
      tx.amount,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.payment_method === 'cash' ? 'Cash' : 'Debit',
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transaksi-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('File CSV berhasil diunduh', 'success')
  }

  return (
    <div className="page-enter space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Riwayat <span className="text-primary">Transaksi</span>
          </h1>
          <p className="text-sm font-medium opacity-60 mt-1">
            Menampilkan {transactions.length} catatan keuangan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost rounded-2xl group ${showFilters ? 'border-primary ring-2 ring-primary/20' : ''}`}
            id="toggle-filters"
          >
            <Filter size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Filter</span>
          </button>
          <button onClick={handleExportCSV} className="btn-ghost rounded-2xl" id="export-csv">
            <Download size={18} />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="input-dark pl-12 h-14"
            id="search-transactions"
          />
        </div>
        <div className="hidden md:flex glass-card p-4 items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar size={16} className="text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-tighter opacity-70">Periode Aktif</span>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-6 md:p-8 slide-up border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">
              Pengaturan Filter
            </h3>
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setCategory('all')
                setPaymentMethod('all')
                setType('all')
              }}
              className="text-xs font-bold text-primary-light hover:underline px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Reset Semua
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter opacity-50 ml-1">Dari Tanggal</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-dark h-11 text-sm pt-4" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter opacity-50 ml-1">Sampai Tanggal</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-dark h-11 text-sm pt-4" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter opacity-50 ml-1">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="select-dark h-11 text-sm">
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter opacity-50 ml-1">Metode</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="select-dark h-11 text-sm">
                <option value="all">Semua Metode</option>
                <option value="cash">💵 Cash / Tunai</option>
                <option value="debit">💳 Debit / Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter opacity-50 ml-1">Jenis Transaksi</label>
              <select value={type} onChange={e => setType(e.target.value)} className="select-dark h-11 text-sm">
                <option value="all">Semua Jenis</option>
                <option value="expense">🔻 Pengeluaran</option>
                <option value="income">🔺 Pemasukan</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-10">
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-2xl" />
                <div className="flex-1">
                  <div className="skeleton h-5 w-48 mb-2" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-6 w-32" />
              </div>
            ))}
          </div>
        ) : dailyGroups.length === 0 ? (
          <div className="glass-card p-20 text-center bg-white/5 border-dashed">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pencarian Tidak Ditemukan</h3>
            <p className="text-sm opacity-60">
              Coba gunakan kata kunci lain atau ubah pengaturan filter Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {dailyGroups.map(([date, group]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="flex items-center justify-between mb-4 sticky top-0 z-10 py-2 bg-[#020617]/80 backdrop-blur-sm px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {new Date(date).toLocaleDateString('id-ID', { weekday: 'short' })}
                    </div>
                    <h3 className="text-base font-bold tracking-tight">
                      {formatDate(date)}
                    </h3>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    {group.totalIncome > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                        <ArrowUpRight size={12} />
                        {formatCurrency(group.totalIncome)}
                      </div>
                    )}
                    {group.totalExpense > 0 && (
                      <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/10">
                        <ArrowDownLeft size={12} />
                        {formatCurrency(group.totalExpense)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {group.transactions.map((tx) => {
                    const catInfo = getCategoryInfo(tx.category)
                    return (
                      <div
                        key={tx.id}
                        className="glass-card hover:bg-white/[0.03] p-3 md:p-5 flex items-center gap-3 md:gap-5 transition-all duration-300 group relative overflow-hidden"
                      >
                        {/* Type Indicator Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        
                        <div className="flex-shrink-0 scale-90 md:scale-100">
                          <CategoryIcon category={tx.category} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-base font-bold truncate group-hover:text-primary-light transition-colors">
                            {tx.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">
                              {catInfo.label}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                              tx.payment_method === 'cash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {tx.payment_method}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p
                            className="text-sm md:text-lg font-black tracking-tight"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              color: tx.type === 'income' ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                            }}
                          >
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingTx(tx)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-all border border-white/5"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-white/5"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="modal-overlay z-[100]" onClick={() => setEditingTx(null)}>
          <div 
            className="modal-content !max-w-2xl border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative p-2">
              <div className="flex items-center justify-between mb-8 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light">
                    <Pencil size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      Edit Transaksi
                    </h2>
                    <p className="text-xs opacity-60">Perbarui rincian transaksi Anda.</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTx(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-4 pb-4">
                <TransactionForm
                  editTransaction={editingTx}
                  onClose={() => { setEditingTx(null); refetch() }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="modal-overlay z-[100]" onClick={() => setDeletingId(null)}>
          <div className="modal-content !max-w-md p-0 overflow-hidden border-rose-500/30" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6 rotate-12">
                <Trash2 size={40} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-black mb-3 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Hapus Transaksi?
              </h2>
              <p className="text-sm opacity-60 leading-relaxed px-6">
                Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen dari riwayat Anda.
              </p>
            </div>
            <div className="flex p-6 gap-4 bg-rose-500/5">
              <button onClick={() => setDeletingId(null)} className="btn-ghost flex-1 h-12 font-bold !bg-transparent border-white/10">
                Batalkan
              </button>
              <button 
                onClick={() => handleDelete(deletingId)} 
                className="btn-danger flex-1 h-12 font-bold shadow-lg shadow-rose-500/20"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
