import { Header } from '@/components/header'
import { SkipLink } from '@/components/skip-link'
import { CartProvider } from '@/lib/hooks/use-cart'
import { CartButton } from '@/components/cart-button'
import { BottomNav } from '@/components/bottom-nav'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/', label: 'Explorar' },
    { href: '/orders', label: 'Pedidos' },
  ]

  return (
    <CartProvider>
      <SkipLink />
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <BottomNav role="cliente" items={navItems} />
          <main id="main-content" className="flex-1 relative bg-background overflow-hidden">
            {children}
            <div className="fixed bottom-24 right-4 z-50">
              <CartButton />
            </div>
          </main>
        </div>
      </div>
    </CartProvider>
  )
}
