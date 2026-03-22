'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { loginSchema, LoginInput } from '@/lib/validations/auth'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
  const t = useTranslations('Auth')
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    const res = await signIn(data)
    if (res?.error) {
      toast.error('Email ou senha incorretos')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto p-6 border rounded-md shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">{t('login')}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input id="email" type="email" {...form.register('email')} aria-describedby="email-error" />
        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-red-500">{t('invalidEmail')}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <Input id="password" type="password" {...form.register('password')} aria-describedby="password-error" />
        {form.formState.errors.password && (
          <p id="password-error" className="text-sm text-red-500">{t('required')}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? '...' : t('login')}
      </Button>
      
      <div className="flex justify-between text-sm mt-4">
        <Link href="/reset-password" className="text-blue-500 hover:underline">{t('reset')}</Link>
        <Link href="/signup" className="text-blue-500 hover:underline">{t('signup')}</Link>
      </div>
    </form>
  )
}
