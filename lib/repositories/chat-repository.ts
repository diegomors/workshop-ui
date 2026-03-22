import { IChatRepository } from './chat-repository-interface'
import { SupabaseChatRepository } from './supabase-chat-repository'

let chatRepository: IChatRepository | null = null

/**
 * Factory for the chat/tracking repository.
 * Always returns the Supabase implementation.
 */
export function getChatRepository(): IChatRepository {
  if (!chatRepository) {
    chatRepository = new SupabaseChatRepository()
  }
  return chatRepository
}
