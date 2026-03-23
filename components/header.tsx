import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { MizzButton } from '@/components/mizz/MizzButton'
import { MizzAvatar } from '@/components/mizz/MizzAvatar'
import { RoleSwitcher } from '@/components/role-switcher'
import type { UserRole } from '@/types/index'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { name: string; role: UserRole; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('name, role, avatar_url').eq('id', user.id).single()
    profile = data
  }

  const initials = profile?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="flex flex-row items-center justify-between h-14 px-4 bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <span className="font-bold text-xl text-primary tracking-tight">Mizz</span>
      {profile && (
        <div className="flex items-center gap-3">
          <RoleSwitcher currentRole={profile.role} />
          <div className="flex items-center gap-2">
            <MizzAvatar
              src={profile.avatar_url ?? undefined}
              alt={profile.name}
              initials={initials}
              size="sm"
            />
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {profile.name}
            </span>
          </div>
          <form action={signOut}>
            <MizzButton type="submit" variant="ghost" size="sm">Sair</MizzButton>
          </form>
        </div>
      )}
    </header>
  )
}
