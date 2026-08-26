import { ApiRequestError } from '~/types/auth'
import type { Application } from '~/types/application'
import { useApplicationsService } from '~/services/applications'

export function useMyApplications() {
  const applicationsService = useApplicationsService()
  const authStore = useAuthStore()

  const applications = ref<Application[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMine() {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user) return
      applications.value = await applicationsService.list({ candidate_id: authStore.user.id, per_page: 100 })
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
    } finally {
      loading.value = false
    }
  }

  return { applications, loading, error, fetchMine }
}
