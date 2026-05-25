'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, Transaction } from '@/lib/utils'
import { useToast } from '@/components/layout/Toast'
import { useTransactions } from '@/hooks/useTransactions'
import { Save, X, Calendar, FileText, Tag, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface TransactionFormProps {
  editTransaction?: Transaction | null
  onClose?: () => void
}

export default function TransactionForm({ editTransaction, onClose }: TransactionFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const { addTransaction, updateTransaction } = useTransactions()

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'food',
    amount: '',
    payment_method: 'cash' as 'cash' | 'debit',
    type: 'expense' as 'income' | 'expense',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editTransaction) {
      setForm({
        date: editTransaction.date,
        description: editTransaction.description,
        category: editTransaction.category,
        amount: String(editTransaction.amount),
        payment_method: editTransaction.payment_method,
        type: editTransaction.type,
      })
    }
  }, [editTransaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const amount = parseFloat(form.amount.replace(/\D/g, ''))
      if (isNaN(amount) || amount <= 0) {
        showToast('Masukkan nominal yang valid', 'error')
        setSubmitting(false)
        return
      }

      const payload = {
        date: form.date,
        description: form.description,
        category: form.category,
        amount,
        payment_method: form.payment_method,
        type: form.type,
      }

      if (editTransaction) {
        await updateTransaction(editTransaction.id, payload)
        showToast('Transaksi berhasil diperbarui!', 'success')
      } else {
        await addTransaction(payload)
        showToast('Transaksi berhasil ditambahkan!', 'success')
      }

      if (onClose) {
        onClose()
      } else {
        router.push('/transactions')
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan transaksi', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatAmount = (value: string) => {
    const num = value.replace(/\D/g, '')
    if (!num) return ''
    return new Intl.NumberFormat('id-ID').format(parseInt(num))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Toggle */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">
          Tipe Transaksi
        </label>
        <div className="toggle-group p-1 bg-white/5 h-12 md:h-14">
          <button
            type="button"
            className={`toggle-item flex-1 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${form.type === 'expense' ? 'active active-red' : 'opacity-40 hover:opacity-100'}`}
            onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowDownLeft size={16} />
              Pengeluaran
            </span>
          </button>
          <button
            type="button"
            className={`toggle-item flex-1 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${form.type === 'income' ? 'active active-green' : 'opacity-40 hover:opacity-100'}`}
            onClick={() => setForm(f => ({ ...f, type: 'income' }))}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowUpRight size={16} />
              Pemasukan
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider opacity-50 ml-1">
            Tanggal
          </label>
          <div className="relative group">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary-light transition-colors" />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              className="input-dark pl-12 h-12 md:h-14 text-sm"
              required
              id="form-date"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider opacity-50 ml-1">
            Kategori
          </label>
          <div className="relative group">
            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary-light transition-colors" />
            <select
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="select-dark pl-12 h-12 md:h-14 text-sm"
              id="form-category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider opacity-50 ml-1">
          Deskripsi
        </label>
        <div className="relative group">
          <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary-light transition-colors" />
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Contoh: Makan siang..."
            className="input-dark pl-12 h-12 md:h-14 text-sm"
            required
            id="form-description"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider opacity-50 ml-1">
            Nominal
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 group-focus-within:text-primary-light transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
              Rp
            </span>
            <input
              type="text"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: formatAmount(e.target.value) }))}
              placeholder="0"
              className="input-dark pl-12 h-12 md:h-14 text-base md:text-lg"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}
              required
              id="form-amount"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider opacity-50 ml-1">
            Metode
          </label>
          <div className="toggle-group p-1 bg-white/5 h-12 md:h-14">
            <button
              type="button"
              className={`toggle-item flex-1 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${form.payment_method === 'cash' ? 'active active-blue' : 'opacity-40 hover:opacity-100'}`}
              onClick={() => setForm(f => ({ ...f, payment_method: 'cash' }))}
            >
              💵 Cash
            </button>
            <button
              type="button"
              className={`toggle-item flex-1 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${form.payment_method === 'debit' ? 'active active-blue' : 'opacity-40 hover:opacity-100'}`}
              onClick={() => setForm(f => ({ ...f, payment_method: 'debit' }))}
            >
              💳 Debit
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost h-12 md:h-14 flex-1 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl border-white/5"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary h-12 md:h-14 flex-[2] text-xs md:text-sm font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50"
          id="form-submit"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} />
              {editTransaction ? 'Perbarui' : 'Simpan'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
