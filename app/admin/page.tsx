import { MizzStatCard } from '@/components/mizz/MizzStatCard'
import { getAdminContext } from '@/lib/actions/restaurant'

export default async function AdminDashboardPage() {
  const ctx = await getAdminContext()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      {ctx ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MizzStatCard value="0" label="Pedidos hoje" variant="primary" />
          <MizzStatCard value="R$ 0" label="Faturamento" />
          <MizzStatCard value="0" label="Em preparo" variant="accent" />
          <MizzStatCard value="0" label="Entregas ativas" />
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum restaurante vinculado a esta conta.</p>
      )}
    </div>
  )
}
