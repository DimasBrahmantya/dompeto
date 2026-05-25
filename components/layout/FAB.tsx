'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function FAB() {
  return (
    <Link href="/add" className="fab md:hidden" aria-label="Tambah transaksi" id="fab-add">
      <Plus size={24} />
    </Link>
  )
}
