'use client'

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * OTP-style input with individual digit fields.
 * Used for delivery confirmation code.
 */
export function OtpInput({ length = 4, value, onChange, disabled = false }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d?$/.test(digit)) return

      const chars = value.split('')
      // Pad to length
      while (chars.length < length) chars.push('')
      chars[index] = digit
      const newValue = chars.join('').slice(0, length)
      onChange(newValue)

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputsRef.current[index + 1]?.focus()
      }
    },
    [value, length, onChange]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    },
    [value]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pasted) {
        onChange(pasted)
        const lastIndex = Math.min(pasted.length, length) - 1
        inputsRef.current[lastIndex]?.focus()
      }
    },
    [length, onChange]
  )

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  )
}
