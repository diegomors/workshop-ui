import { CartSummary } from './cart-summary'

export default function CartPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold border-b pb-4">Resumo do Pedido</h1>
      <CartSummary />
    </div>
  )
}
