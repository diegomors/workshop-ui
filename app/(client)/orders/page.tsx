import { getCustomerOrders } from '@/lib/actions/order'
import { OrderList } from '@/components/order-list'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Customer Orders History/Active page.
 */
export default async function CustomerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const allOrders = await getCustomerOrders()

  const activeStatuses = ['REALIZADO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO_PARA_RETIRADA', 'EM_ROTA']
  
  const activeOrders = allOrders.filter(o => activeStatuses.includes(o.status))
  const historyOrders = allOrders.filter(o => !activeStatuses.includes(o.status))

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-12 mb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe seus pedidos ativos e seu histórico.</p>
      </header>

      <section>
        <OrderList 
          title="Pedidos Ativos" 
          orders={activeOrders} 
          emptyMessage="Você não tem pedidos em andamento no momento."
        />
      </section>

      <div className="border-t border-border pt-12">
        <section>
          <OrderList 
            title="Histórico Recente" 
            orders={historyOrders} 
          />
        </section>
      </div>
    </div>
  )
}
