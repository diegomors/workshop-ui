import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StripeConnectButton } from './stripe-connect-button'
import { MizzButton } from '@/components/mizz/MizzButton'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, stripe_account_id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Nenhum restaurante encontrado para esta conta.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pagamentos — Stripe Connect</h2>
        <p className="text-sm text-muted-foreground">
          Conecte sua conta ao Stripe para receber pagamentos dos pedidos.
        </p>

        <StripeConnectButton
          restaurantId={restaurant.id}
          hasStripeAccount={!!restaurant.stripe_account_id}
        />
      </div>
    </div>
  )
}
