'use client'

import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: string
  isMine: boolean
  timestamp: string
}

export function ChatMessageBubble({ message, isMine, timestamp }: ChatMessageProps) {
  const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-right'
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
