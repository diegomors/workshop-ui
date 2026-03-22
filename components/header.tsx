import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
    profile = data
  }

  return (
    <header className="flex flex-row items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="font-bold text-2xl text-blue-600">Mizz</div>
      {profile && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col items-end">
             <span className="font-medium">{profile.name}</span>
             <span className="text-xs text-gray-500 capitalize">{profile.role}</span>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">Sair</Button>
          </form>
        </div>
      )}
    </header>
  )
}
