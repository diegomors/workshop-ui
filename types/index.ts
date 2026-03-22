export type UserRole = 'cliente' | 'admin' | 'cozinha' | 'entregador'

export type Profile = {
  id: string
  role: UserRole
  name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}
