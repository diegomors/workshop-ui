import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { MizzText } from '@/components/mizz/MizzText'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
    profile = data
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-background border-b border-border sticky top-0 z-40">
      <MizzText variant="subtitle" className="text-primary font-bold">
        Mizz
      </MizzText>
      {profile && (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex flex-col items-end">
            <MizzText variant="body" className="font-medium">{profile.name}</MizzText>
            <MizzText variant="caption" className="text-muted-foreground capitalize">{profile.role}</MizzText>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-neutral-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
