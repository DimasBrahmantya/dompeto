'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { href: '/analytics', icon: BarChart3, label: 'Analitik' },
  { href: '/top-expenses', icon: TrendingUp, label: 'Top' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${isActive ? 'bg-primary/20 scale-110' : 'hover:bg-white/5'}
            `}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="mt-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
