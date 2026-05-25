'use client'

import TransactionForm from '@/components/forms/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddTransactionPage() {
  return (
    <div className="page-enter max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <Link
          href="/dashboard"
          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Transaksi <span className="text-primary-light">Baru</span>
          </h1>
          <p className="text-sm font-medium opacity-60">
            Catat arus kas Anda dengan detail dan akurat.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card p-2 md:p-8 border-primary/20 shadow-2xl shadow-primary/5">
        <div className="p-4 md:p-0">
          <TransactionForm />
        </div>
      </div>
    </div>
  )
}
