import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { SkipLink } from '@/components/skip-link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/menu', label: 'Cardápio' },
    { href: '/admin/orders', label: 'Pedidos' },
    { href: '/admin/reports', label: 'Relatórios' },
    { href: '/admin/settings', label: 'Configurações' },
  ]

  return (
    <>
      <SkipLink />
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <BottomNav role="admin" items={navItems} />
        <main id="main-content" className="flex-1 p-4 pb-20 md:pb-4 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </>
  )
}
