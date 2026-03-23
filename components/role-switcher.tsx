'use client'

import { useTransition } from 'react'
import { switchRole } from '@/lib/actions/auth'
import { MizzSelect } from '@/components/mizz/MizzSelect'
import type { UserRole } from '@/types/index'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'cozinha', label: 'Cozinheiro' },
  { value: 'entregador', label: 'Entregador' },
  { value: 'cliente', label: 'Cliente' },
]

type RoleSwitcherProps = {
  currentRole: UserRole
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole
    if (newRole === currentRole) return
    startTransition(() => {
      switchRole(newRole)
    })
  }

  return (
    <div className="w-40">
      <MizzSelect
        options={ROLE_OPTIONS}
        value={currentRole}
        onChange={handleChange}
        disabled={isPending}
        label="Perfil"
      />
    </div>
  )
}
