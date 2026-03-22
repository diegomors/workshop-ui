'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatScreen } from '@/components/chat/chat-screen'
import { Loader2 } from 'lucide-react'

type ChatPageProps = {
  params: Promise<{ id: string }>
}

export default function DeliveryChatPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Não autorizado</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <ChatScreen
        orderId={id}
        currentUserId={userId}
        backHref={`/delivery/orders/${id}`}
      />
    </div>
  )
}
