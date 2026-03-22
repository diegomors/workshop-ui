import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ payment_intent?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams
  const paymentIntentId = params.payment_intent

  let order = null

  if (paymentIntentId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, total, service_fee, delivery_code, created_at, status')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    order = data
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col items-center text-center h-full justify-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-green-700 mb-2">Pagamento Confirmado!</h1>
      <p className="text-gray-500 mb-6">Seu pedido foi realizado com sucesso.</p>

      {order ? (
        <div className="bg-white border rounded-lg p-6 w-full text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pedido</span>
            <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span>
          </div>
          {order.delivery_code && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Código de entrega</span>
              <span className="font-bold text-lg">{order.delivery_code}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total pago</span>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <Link
              href={`/orders/${order.id}`}
              className="block w-full text-center bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              Acompanhar Pedido
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
          <p className="text-sm text-yellow-700">
            Seu pagamento foi processado. O pedido será criado em instantes.
          </p>
          <Link
            href="/orders"
            className="block mt-4 text-center bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            Ver Meus Pedidos
          </Link>
        </div>
      )}

      <Link href="/" className="mt-6 text-blue-600 hover:underline text-sm">
        Voltar ao início
      </Link>
    </div>
  )
}
