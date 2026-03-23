/**
 * Admin Reports Dashboard (PRD-07).
 * Two read-only tables: prep time per item + delivery performance.
 * Fixed period: last 7 days. No filters, no interaction.
 */
import { getAdminContext } from '@/lib/actions/restaurant'
import { getPrepTimeReport, getDeliveryPerformanceReport } from '@/lib/actions/reports'
import { PrepTimeRow, DeliveryPerformanceRow } from '@/types/reports'
import { redirect } from 'next/navigation'

export default async function ReportsPage() {
  const context = await getAdminContext()
  if (!context) return redirect('/login')

  const { restaurantId } = context

  const [prepTimeData, deliveryData] = await Promise.all([
    getPrepTimeReport(restaurantId),
    getDeliveryPerformanceReport(restaurantId),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600">
          Últimos 7 dias
        </span>
      </div>

      <section aria-labelledby="prep-time-heading">
        <h2 id="prep-time-heading" className="mb-4 text-xl font-semibold">
          Tempo Médio de Preparo
        </h2>
        <PrepTimeTable data={prepTimeData} />
      </section>

      <section aria-labelledby="delivery-heading">
        <h2 id="delivery-heading" className="mb-4 text-xl font-semibold">
          Desempenho da Equipe
        </h2>
        <DeliveryPerformanceTable data={deliveryData} />
      </section>
    </div>
  )
}

function PrepTimeTable({ data }: { data: PrepTimeRow[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        Nenhum pedido nos últimos 7 dias
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-700">Item do Cardápio</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Qtd Pedidos</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Tempo Médio (min)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.itemName} className="hover:bg-gray-50">
              <td className="px-4 py-3">{row.itemName}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.totalOrders}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.avgPrepTimeMin.toFixed(1)} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DeliveryPerformanceTable({ data }: { data: DeliveryPerformanceRow[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        Nenhuma entrega nos últimos 7 dias
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-700">Entregador</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Total Entregas</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Tempo Médio (min)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.delivererName} className="hover:bg-gray-50">
              <td className="px-4 py-3">{row.delivererName}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.totalDeliveries}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.avgDeliveryTimeMin.toFixed(1)} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
