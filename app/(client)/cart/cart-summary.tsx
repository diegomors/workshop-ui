'use client'

import { useCart } from '@/lib/hooks/use-cart'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CartSummary() {
  const { state: { items, restaurantId }, dispatch, totalPrice } = useCart()


  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border rounded">
        <p className="text-gray-500 mb-6 text-lg">Seu carrinho está vazio.</p>
        {restaurantId ? (
          <Link href={`/restaurant/${restaurantId}`}>
            <Button>Voltar ao Cardápio</Button>
          </Link>
        ) : (
          <Link href="/">
            <Button>Ver Restaurantes</Button>
          </Link>
        )}
      </div>
    )
  }

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty < 1) return
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: qty } })
  }

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => {
          const modTotal = item.modifiers.reduce((acc, m) => acc + m.additional_price, 0)
          const unitPrice = item.price + modTotal
          const subtotal = unitPrice * item.quantity

          return (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between p-4 bg-white border rounded shadow-sm gap-4">
              <div className="flex gap-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.modifiers.length > 0 && (
                    <ul className="text-sm text-gray-500 mt-1">
                      {item.modifiers.map(m => (
                        <li key={m.id}>+ {m.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.additional_price)})</li>
                      ))}
                    </ul>
                  )}
                  <p className="font-semibold text-blue-600 mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                <div className="flex items-center border rounded-md mb-2">
                  <button className="px-3 py-1 hover:bg-gray-100 font-bold" onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>-</button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button className="px-3 py-1 hover:bg-gray-100 font-bold" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="text-red-500 text-sm hover:underline" onClick={() => handleRemove(item.id)}>Remover</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold mb-6">
          <span>Total:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
        </div>

        <div className="flex flex-col gap-4">
          <Button size="lg" className="w-full text-lg" onClick={() => alert('Continua no PRD-05...')}>
            Continuar para Pagamento
          </Button>
          <Link href={`/restaurant/${restaurantId}`} className="text-center text-blue-600 hover:underline">
            Adicionar mais itens
          </Link>
        </div>
      </div>
    </div>
  )
}
