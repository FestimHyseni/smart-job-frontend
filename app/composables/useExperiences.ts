import { ApiRequestError } from '~/types/auth'
import type { Experience, ExperiencePayload } from '~/types/profileExtras'
import { useExperiencesService } from '~/services/profileExtras'

export function useExperiences() {
  const service = useExperiencesService()
  const authStore = useAuthStore()

  const items = ref<Experience[]>([])
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

  async function add(payload: ExperiencePayload) {
    const created = await service.create({ ...payload, user_id: authStore.user?.id })
    items.value.unshift(created)
    return created
  }

  async function remove(id: number) {
    await service.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loading, error, fetchMine, add, remove }
}
