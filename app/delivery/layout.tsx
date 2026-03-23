import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { SkipLink } from '@/components/skip-link'

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/delivery', label: 'Entregas' },
  ]

  return (
    <>
      <SkipLink />
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <BottomNav role="entregador" items={navItems} />
        <main id="main-content" className="flex-1 p-4 pb-20 md:pb-4 overflow-y-auto bg-neutral-10">
          {children}
        </main>
      </div>
    </>
  )
}
