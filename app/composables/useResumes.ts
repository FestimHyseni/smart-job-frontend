import { ApiRequestError } from '~/types/auth'
import type { Resume } from '~/types/application'
import { useResumesService } from '~/services/profileExtras'
import { useApplicationsService } from '~/services/applications'

export function useResumes() {
  const service = useResumesService()
  const applicationsService = useApplicationsService()
  const authStore = useAuthStore()

  const items = ref<Resume[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMine() {
    loading.value = true
    error.value = null
    try {
      const all = await service.list()
      items.value = all.filter((item) => item.user_id === authStore.user?.id)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
    } finally {
      loading.value = false
    }
  }

  async function upload(file: File) {
    const created = await applicationsService.uploadResume(authStore.user!.id, file)
    items.value.unshift(created)
    return created
  }

  async function remove(id: number) {
    await service.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loading, error, fetchMine, upload, remove }
}
