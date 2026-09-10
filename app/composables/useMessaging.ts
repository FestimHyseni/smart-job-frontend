import { ApiRequestError } from '~/types/auth'
import type { Conversation } from '~/types/messaging'
import { useMessagingService } from '~/services/messaging'

// Module-scoped (shared) state: every component calling useMessaging() reads
// and writes the same conversations list, so marking a thread as read in one
// place (e.g. the thread page) is reflected immediately everywhere else
// (e.g. the navbar's unread badge), without waiting for the next poll.
const conversations = ref<Conversation[]>([])
const current = ref<Conversation | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useMessaging() {
  const service = useMessagingService()
  const authStore = useAuthStore()

  const unreadCount = computed(() =>
    conversations.value.reduce(
      (total, c) => total + c.messages.filter((m) => m.sender_id !== authStore.user?.id && !m.read_at).length,
      0,
    ),
  )

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
      const inList = conversations.value.find((c) => c.id === id)
      if (inList) {
        inList.messages = current.value.messages
      } else {
        conversations.value = [...conversations.value, current.value]
      }
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

  async function markThreadRead(conversation: Conversation) {
    const unread = conversation.messages.filter((m) => m.sender_id !== authStore.user?.id && !m.read_at)
    if (!unread.length) return
    const now = new Date().toISOString()
    for (const m of unread) m.read_at = now
    const inList = conversations.value.find((c) => c.id === conversation.id)
    if (inList && inList !== conversation) {
      for (const m of inList.messages) {
        if (unread.some((u) => u.id === m.id)) m.read_at = now
      }
    }
    await Promise.all(unread.map((m) => service.markMessageRead(m.id)))
  }

  return { conversations, current, loading, error, unreadCount, otherParticipant, fetchMine, fetchThread, findOrStartConversationWith, send, markThreadRead }
}
