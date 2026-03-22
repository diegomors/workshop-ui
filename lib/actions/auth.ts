'use server'

import { createClient } from '@/lib/supabase/server'
import { LoginInput, SignUpInput, ResetPasswordInput } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'

export async function signUp(data: SignUpInput) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        phone: data.phone || '',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signIn(data: LoginInput) {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
  const role = profile?.role || 'cliente'

  if (role === 'admin') redirect('/admin')
  if (role === 'cozinha') redirect('/admin/orders')
  if (role === 'entregador') redirect('/delivery')
  
  redirect('/')
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error) {
    console.error('Logout error:', error)
  }
  redirect('/login')
}

export async function resetPassword(data: ResetPasswordInput) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(data.email)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
