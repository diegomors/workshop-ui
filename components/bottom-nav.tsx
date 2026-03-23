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
    <nav className="fixed bottom-0 w-full left-0 right-0 bg-card border-t border-border flex items-center justify-around z-50 md:relative md:w-64 md:flex-col md:border-r md:border-t-0 md:h-screen md:justify-start">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 md:flex-none md:w-full flex flex-col md:flex-row items-center md:justify-start p-3 text-xs md:text-sm border-b-transparent md:border-b transition-colors",
              isActive
                ? "text-primary font-bold bg-primary/5"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <span className="md:ml-2">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
