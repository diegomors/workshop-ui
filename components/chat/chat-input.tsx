'use client'

import { useState, useCallback, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  maxLength?: number
  disabled?: boolean
}

export function ChatInput({ onSend, maxLength = 500, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }, [text, onSend, disabled])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t bg-background p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '100px' }}
          />
          <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground">
            {text.length}/{maxLength}
          </span>
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="shrink-0 rounded-full size-10"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
