'use client'

import type { PaymentMethod } from '@/types/payment'

type PaymentMethodSelectorProps = {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold text-lg mb-3">Forma de Pagamento</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect('card')}
          className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors ${
            selected === 'card'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <span className="text-sm font-medium">Cartão de Crédito</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('pix')}
          className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors ${
            selected === 'pix'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.66 10.17l-2.83 2.83a1 1 0 01-1.41 0l-2.83-2.83a1 1 0 010-1.41l2.83-2.83a1 1 0 011.41 0l2.83 2.83a1 1 0 010 1.41zm-5.49 5.49l-2.83 2.83a1 1 0 01-1.41 0l-2.83-2.83a1 1 0 010-1.41l2.83-2.83a1 1 0 011.41 0l2.83 2.83a1 1 0 010 1.41z" />
          </svg>
          <span className="text-sm font-medium">Pix</span>
        </button>
      </div>
    </div>
  )
}
