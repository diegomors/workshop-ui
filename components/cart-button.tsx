'use client'

import Link from 'next/link'
import { useCart } from '@/lib/hooks/use-cart'

export function CartButton() {
  const { totalCount } = useCart()

  if (totalCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/cart" className="flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-full shadow-lg relative hover:bg-primary/90 active:bg-primary/80 transition-colors">
        <span>🛒</span>
        <span className="absolute -top-2 -right-2 bg-negative-2 text-neutral-0 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {totalCount}
        </span>
      </Link>
    </div>
  )
}
