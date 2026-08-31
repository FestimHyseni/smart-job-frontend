import { ApiRequestError } from '~/types/auth'
import type { Conversation } from '~/types/messaging'
import { useMessagingService } from '~/services/messaging'

export function useMessaging() {
  const service = useMessagingService()
  const authStore = useAuthStore()

  const conversations = ref<Conversation[]>([])
  const current = ref<Conversation | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown) {
    error.value = err instanceof ApiRequestError ? err.message : 'Diçka shkoi keq. Provo përsëri.'
  }

  function otherParticipant(conversation: Conversation) {
    return conversation.participants.find((p) => p.id !== authStore.user?.id) ?? null
  }

  async function fetchMine() {
    loading.value = true
    error.value = null
    try {
      const all = await service.listConversations()
      conversations.value = all.filter((c) => c.participants.some((p) => p.id === authStore.user?.id))
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchThread(id: number) {
    loading.value = true
    error.value = null
    try {
      current.value = await service.showConversation(id)
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  async function findOrStartConversationWith(otherUserId: number): Promise<Conversation> {
    const me = authStore.user!.id
    const all = await service.listConversations()
    const existing = all.find((c) => {
      const ids = c.participants.map((p) => p.id)
      return ids.length === 2 && ids.includes(me) && ids.includes(otherUserId)
    })
    if (existing) return existing
    return await service.startConversation([me, otherUserId])
  }

  async function send(conversationId: number, text: string) {
    if (!text.trim()) return
    await service.sendMessage(conversationId, authStore.user!.id, text.trim())
    await fetchThread(conversationId)
  }

  return { conversations, current, loading, error, otherParticipant, fetchMine, fetchThread, findOrStartConversationWith, send }
}
