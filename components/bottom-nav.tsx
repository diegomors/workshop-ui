'use client'

import { usePathname, useRouter } from 'next/navigation'
import { MizzBottomNavigation, type MizzBottomNavItem } from '@/components/mizz/MizzBottomNavigation'

type NavItem = {
  href: string
  label: string
  icon?: React.ReactNode
}

type BottomNavProps = {
  role: string
  items: NavItem[]
}

/** Default icon for nav items that don't provide one */
function DefaultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
    </svg>
  )
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  if (items.length === 0) return null

  const mizzItems: MizzBottomNavItem[] = items.map((item) => ({
    value: item.href,
    label: item.label,
    icon: item.icon ?? <DefaultIcon />,
  }))

  const activeValue = items.find((item) => pathname === item.href)?.href ?? items[0].href

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-64 md:shrink-0">
      <MizzBottomNavigation
        items={mizzItems}
        value={activeValue}
        onChange={(value) => router.push(value)}
        className="md:flex-col md:h-full md:border-t-0 md:border-r md:border-border"
      />
    </div>
  )
}
