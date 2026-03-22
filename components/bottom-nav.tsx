'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

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
    <nav className="fixed bottom-0 w-full left-0 right-0 bg-white border-t flex items-center justify-around z-50 md:relative md:w-64 md:flex-col md:border-r md:border-t-0 md:h-screen md:justify-start">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex-1 md:flex-none md:w-full flex flex-col md:flex-row items-center md:justify-start p-3 text-xs md:text-sm border-b-transparent md:border-b",
              isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <span className="md:ml-2">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
