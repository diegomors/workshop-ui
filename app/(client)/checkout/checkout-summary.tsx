'use client'

import { CartItem } from '@/types/menu'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

type CheckoutSummaryProps = {
  items: CartItem[]
  subtotal: number
  serviceFee: number
  total: number
}

export function CheckoutSummary({ items, subtotal, serviceFee, total }: CheckoutSummaryProps) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <h2 className="font-semibold text-lg mb-4">Resumo do Pedido</h2>

      <ul className="space-y-3">
        {items.map((item) => {
          const modTotal = item.modifiers.reduce((acc, m) => acc + m.additional_price, 0)
          const itemTotal = (item.price + modTotal) * item.quantity

          return (
            <li key={item.id} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.modifiers.length > 0 && (
                  <ul className="text-xs text-muted-foreground ml-4">
                    {item.modifiers.map((m) => (
                      <li key={m.id}>+ {m.name} ({formatCurrency(m.additional_price)})</li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="text-neutral-500 whitespace-nowrap">{formatCurrency(itemTotal)}</span>
            </li>
          )
        })}
      </ul>

      <div className="border-t mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-200">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-200">Taxa de serviço (10%)</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
