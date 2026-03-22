'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getChatMessages, sendChatMessage } from '@/lib/actions/chat'
import { ChatMessage } from '@/types/chat'

type UseChatReturn = {
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
}

/**
 * Hook for real-time chat using Supabase Realtime.
 * Subscribes to new chat_messages for the given order.
 */
export function useChat(orderId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useRef(createClient()).current

  // Load initial messages
  useEffect(() => {
    async function load() {
      const data = await getChatMessages(orderId)
      setMessages(data)
      setLoading(false)
    }
    load()
  }, [orderId])

  // Subscribe to realtime inserts
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicates (message might already be added optimistically)
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  const sendMessage = useCallback(async (message: string) => {
    setSending(true)
    setError(null)

    const result = await sendChatMessage({ order_id: orderId, message })

    if (result.error) {
      setError(result.error)
    }

    setSending(false)
  }, [orderId])

  return { messages, loading, sending, error, sendMessage }
}
