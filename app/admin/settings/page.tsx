import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StripeConnectButton } from './stripe-connect-button'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find restaurant owned by user
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, stripe_account_id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Configurações</h1>
        <p className="text-muted-foreground">Nenhum restaurante encontrado para esta conta.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Pagamentos — Stripe Connect</h2>
        <p className="text-sm text-muted-foreground mb-4">
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
