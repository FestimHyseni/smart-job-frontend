import { ApiRequestError } from '~/types/auth'
import type { CompanyFollow } from '~/types/companyFollow'
import { useCompanyFollowsService } from '~/services/companyFollows'

export function useCompanyFollow() {
  const service = useCompanyFollowsService()
  const authStore = useAuthStore()

  const items = ref<CompanyFollow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMine() {
    if (!authStore.user) return
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

  function isFollowing(companyId: number) {
    return items.value.some((item) => item.company_id === companyId)
  }

  function followIdFor(companyId: number) {
    return items.value.find((item) => item.company_id === companyId)?.id ?? null
  }

  async function toggle(companyId: number) {
    const existingId = followIdFor(companyId)
    if (existingId) {
      await service.unfollow(existingId)
      items.value = items.value.filter((item) => item.id !== existingId)
      return
    }
    const created = await service.follow(authStore.user!.id, companyId)
    items.value.push(created)
  }

  return { items, loading, error, fetchMine, isFollowing, toggle }
}
