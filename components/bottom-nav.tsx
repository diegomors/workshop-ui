'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

type BottomNavProps = {
  role: string
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <nav className="fixed bottom-0 w-full left-0 right-0 bg-card border-t border-border flex items-stretch justify-around z-50 h-16 md:relative md:w-64 md:flex-col md:border-r md:border-t-0 md:h-auto md:justify-start md:py-2 md:gap-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 md:flex-none md:w-full flex flex-col md:flex-row items-center md:justify-start px-3 py-2 md:py-2.5 md:px-4 text-xs md:text-sm rounded-none md:rounded-lg md:mx-2 transition-colors',
              isActive
                ? 'text-primary font-semibold bg-primary/5 border-b-2 md:border-b-0 md:border-l-3 border-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="md:ml-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
