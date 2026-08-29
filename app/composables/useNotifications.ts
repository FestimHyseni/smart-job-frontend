import type { AppNotification } from '~/types/notification'
import { useNotificationsService } from '~/services/notifications'

export function useNotifications() {
  const service = useNotificationsService()
  const authStore = useAuthStore()

  const items = ref<AppNotification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => items.value.filter((n) => !n.read_at).length)

  async function fetchMine() {
    if (!authStore.user) return
    loading.value = true
    try {
      const all = await service.list()
      items.value = all
        .filter((n) => n.user_id === authStore.user?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    const notification = items.value.find((n) => n.id === id)
    if (!notification || notification.read_at) return
    notification.read_at = new Date().toISOString()
    await service.markAsRead(id)
  }

  async function markAllAsRead() {
    await Promise.all(items.value.filter((n) => !n.read_at).map((n) => markAsRead(n.id)))
  }

  return { items, loading, unreadCount, fetchMine, markAsRead, markAllAsRead }
}
