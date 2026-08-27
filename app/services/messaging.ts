import type { Conversation, Message } from '~/types/messaging'
import { useApi } from './api'

export function useMessagingService() {
  const { request } = useApi()

  function listConversations() {
    return request<Conversation[]>('/conversations')
  }

  function showConversation(id: number) {
    return request<Conversation>(`/conversations/${id}`)
  }

  function startConversation(participantIds: number[]) {
    return request<Conversation>('/conversations', {
      method: 'POST',
      body: { participant_ids: participantIds },
    })
  }

  function sendMessage(conversationId: number, senderId: number, message: string) {
    return request<Message>('/messages', {
      method: 'POST',
      body: { conversation_id: conversationId, sender_id: senderId, message },
    })
  }

  return { listConversations, showConversation, startConversation, sendMessage }
}
