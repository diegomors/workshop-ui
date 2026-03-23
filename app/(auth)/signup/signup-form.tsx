'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { signUpSchema, SignUpInput } from '@/lib/validations/auth'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function SignUpForm() {
  const t = useTranslations('Auth')
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', name: '', phone: '' },
  })

  async function onSubmit(data: SignUpInput) {
    const res = await signUp(data)
    if (res?.error) {
      if (res.error.includes('already registered')) {
        toast.error('Este email já está em uso')
      } else {
        toast.error('Erro de conexão. Tente novamente.')
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto p-6 border rounded-md shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">{t('signup')}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input id="name" {...form.register('name')} aria-describedby="name-error" />
        {form.formState.errors.name && (
          <p id="name-error" className="text-sm text-negative-2">{t('required')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input id="email" type="email" {...form.register('email')} aria-describedby="email-error" />
        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-negative-2">{t('invalidEmail')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('phone')}</Label>
        <Input id="phone" type="tel" {...form.register('phone')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <Input id="password" type="password" {...form.register('password')} aria-describedby="pwd-error" />
        {form.formState.errors.password && (
          <p id="pwd-error" className="text-sm text-negative-2">{t('weakPassword')}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? '...' : t('signup')}
      </Button>
      
      <div className="text-center text-sm mt-4">
        <Link href="/login" className="text-primary hover:underline">{t('login')}</Link>
      </div>
    </form>
  )
}
