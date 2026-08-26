import { ApiRequestError } from '~/types/auth'
import type { CandidateSkill, SkillLevel } from '~/types/profileExtras'
import { useCandidateSkillsService } from '~/services/profileExtras'

export function useCandidateSkills() {
  const service = useCandidateSkillsService()
  const authStore = useAuthStore()

  const items = ref<CandidateSkill[]>([])
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

  async function add(skillId: number, level: SkillLevel) {
    const created = await service.create({ skill_id: skillId, level, user_id: authStore.user?.id })
    items.value.push(created)
    return created
  }

  async function remove(id: number) {
    await service.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loading, error, fetchMine, add, remove }
}
