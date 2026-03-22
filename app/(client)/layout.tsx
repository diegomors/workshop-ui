import { Header } from '@/components/header'
import { SkipLink } from '@/components/skip-link'
import { CartProvider } from '@/lib/hooks/use-cart'
import { CartButton } from '@/components/cart-button'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1 overflow-y-auto bg-gray-50 pb-20 relative">
        {children}
        <CartButton />
      </main>
    </CartProvider>
  )
}
