import type { AppNotification } from '~/types/notification'
import { useApi } from './api'

export function useNotificationsService() {
  const { request } = useApi()

  function list() {
    return request<AppNotification[]>('/notifications', {
      params: { per_page: 50 },
    })
  }

  function markAsRead(id: number) {
    return request<AppNotification>(`/notifications/${id}`, {
      method: 'PUT',
      body: { read_at: new Date().toISOString() },
    })
  }

  return { list, markAsRead }
}
