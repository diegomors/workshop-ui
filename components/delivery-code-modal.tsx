'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/otp-input'
import { confirmDelivery } from '@/lib/actions/chat'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface DeliveryCodeModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 120

export function DeliveryCodeModal({ orderId, isOpen, onClose, onSuccess }: DeliveryCodeModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)

  const isLocked = lockoutEnd !== null && Date.now() < lockoutEnd

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutEnd) return

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockoutEnd(null)
        setAttempts(0)
        setCountdown(0)
        setError(null)
      } else {
        setCountdown(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutEnd])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('')
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  const handleConfirm = useCallback(async () => {
    if (code.length !== 4 || isLocked) return

    setLoading(true)
    setError(null)

    const result = await confirmDelivery({ order_id: orderId, code })

    if (result.error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutEnd(Date.now() + LOCKOUT_SECONDS * 1000)
        setError(`Máximo de tentativas atingido. Aguarde ${LOCKOUT_SECONDS} segundos.`)
      } else {
        setError(result.error)
      }

      setCode('')
    } else {
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }

    setLoading(false)
  }, [code, orderId, attempts, isLocked, onSuccess])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !success && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {success ? 'Entrega Confirmada!' : 'Código de Confirmação'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="size-16 text-positive-2" />
            <p className="text-lg font-medium text-positive-2">Entrega realizada com sucesso!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Solicite o código de 4 dígitos ao cliente para confirmar a entrega.
            </p>

            <OtpInput
              value={code}
              onChange={setCode}
              disabled={loading || isLocked}
            />

            {error && (
              <p className="text-sm text-destructive text-center font-medium">
                {error}
              </p>
            )}

            {isLocked && countdown > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Tente novamente em {countdown}s
              </p>
            )}

            {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
              <p className="text-xs text-muted-foreground text-center">
                {MAX_ATTEMPTS - attempts} tentativa(s) restante(s)
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={code.length !== 4 || loading || isLocked}
              >
                {loading ? <Loader2 className="animate-spin size-4" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
