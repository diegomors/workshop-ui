'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@/lib/hooks/use-chat'
import { ChatMessageBubble } from './chat-message'
import { ChatInput } from './chat-input'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ChatScreenProps {
  orderId: string
  currentUserId: string
  backHref: string
}

export function ChatScreen({ orderId, currentUserId, backHref }: ChatScreenProps) {
  const { messages, loading, sending, sendMessage } = useChat(orderId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h2 className="font-bold text-sm">Chat do Pedido</h2>
          <p className="text-xs text-muted-foreground">#{orderId.slice(-4).toUpperCase()}</p>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin size-6 text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg.message}
              isMine={msg.sender_id === currentUserId}
              timestamp={msg.created_at}
            />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={sending} />
    </div>
  )
}
