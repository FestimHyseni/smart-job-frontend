import { ApiRequestError } from '~/types/auth'
import type { SavedJob } from '~/types/savedJob'
import { useSavedJobsService } from '~/services/savedJobs'

export function useSavedJobs() {
  const service = useSavedJobsService()
  const authStore = useAuthStore()

  const items = ref<SavedJob[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMine() {
    loading.value = true
    error.value = null
    try {
      const all = await service.list()
      items.value = all.filter((item) => item.user_id === authStore.user?.id)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Diçka shkoi keq. Provo përsëri.'
    } finally {
      loading.value = false
    }
  }

  function isSaved(jobId: number) {
    return items.value.some((item) => item.job_id === jobId)
  }

  function savedIdFor(jobId: number) {
    return items.value.find((item) => item.job_id === jobId)?.id ?? null
  }

  async function toggle(jobId: number) {
    const existingId = savedIdFor(jobId)
    if (existingId) {
      await service.remove(existingId)
      items.value = items.value.filter((item) => item.id !== existingId)
      return
    }
    const created = await service.save(authStore.user!.id, jobId)
    items.value.push(created)
  }

  return { items, loading, error, fetchMine, isSaved, toggle }
}
