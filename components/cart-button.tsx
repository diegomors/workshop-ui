'use client'

import Link from 'next/link'
import { useCart } from '@/lib/hooks/use-cart'

export function CartButton() {
  const { totalCount } = useCart()

  if (totalCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/cart" className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-full shadow-lg relative hover:bg-blue-700 transition">
        <span>🛒</span>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {totalCount}
        </span>
      </Link>
    </div>
  )
}
