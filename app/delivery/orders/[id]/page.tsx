import { getOrder } from '@/lib/actions/order'
import { DeliveryMap } from '@/components/map/delivery-map'
import { notFound } from 'next/navigation'

export default async function OrderNavigationPage({ params }: { params: { id: string } }) {
  const { id } = params
  const order = await getOrder(id)

  if (!order) {
    return notFound()
  }

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden bg-slate-50 flex flex-col">
      <div className="p-4 bg-white border-b shadow-sm z-[1001] flex items-center justify-between">
        <h1 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <div className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full uppercase tracking-wider">
          {order.status}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <DeliveryMap order={order} />
      </div>
    </div>
  )
}
