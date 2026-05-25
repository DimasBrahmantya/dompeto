'use client'

import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Heart,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
} from 'lucide-react'
import { getCategoryInfo } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Heart,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
}

export default function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  const info = getCategoryInfo(category)
  const Icon = iconMap[info.icon] || MoreHorizontal

  return (
    <div
      className="category-icon"
      style={{
        background: `${info.color}15`,
        border: `1px solid ${info.color}30`,
      }}
    >
      <Icon size={size} color={info.color} />
    </div>
  )
}
