'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth'
import { resetPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function ResetPasswordForm() {
  const t = useTranslations('Auth')
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ResetPasswordInput) {
    const res = await resetPassword(data)
    if (res?.error) {
       toast.error('Erro de conexão. Tente novamente.')
    } else {
       toast.success('Link enviado')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto p-6 border rounded-md shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">{t('reset')}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input id="email" type="email" {...form.register('email')} aria-describedby="email-error" />
        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-negative-2">{t('invalidEmail')}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? '...' : t('submit')}
      </Button>
      
      <div className="text-center text-sm mt-4">
         <Link href="/login" className="text-primary hover:underline">{t('login')}</Link>
      </div>
    </form>
  )
}
