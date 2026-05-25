'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  LogOut,
  Wallet,
  Plus,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { href: '/analytics', icon: BarChart3, label: 'Analitik' },
  { href: '/top-expenses', icon: TrendingUp, label: 'Top Pengeluaran' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="hidden md:flex flex-col w-72 h-screen sticky top-0 px-4 py-8 border-r border-white/5 bg-slate-950/40 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-4 px-2 mb-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
          }}
        >
          <Wallet size={24} color="white" />
        </div>
        <div>
          <h1
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            Dompeto
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Finance Manager</p>
        </div>
      </div>

      {/* Quick Add */}
      <Link href="/add" className="btn-primary mb-10 w-full" id="sidebar-add-btn">
        <Plus size={20} />
        <span>Catat Baru</span>
      </Link>

      {/* Navigation */}
      <div className="mb-4 px-2">
        <p className="text-[10px] uppercase tracking-widest font-bold mb-4 opacity-50" style={{ color: 'var(--color-text-muted)' }}>
          Menu Utama
        </p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                id={`nav-${item.href.slice(1)}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto px-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
          id="sidebar-logout"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-400/10 group-hover:bg-red-400/20 transition-colors">
            <LogOut size={18} />
          </div>
          <span className="font-semibold text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
