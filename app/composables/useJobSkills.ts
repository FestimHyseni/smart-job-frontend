import { ApiRequestError } from '~/types/auth'
import type { JobSkill, SkillImportance } from '~/types/jobSkill'
import { useJobSkillsService } from '~/services/jobSkills'

export function useJobSkills() {
  const service = useJobSkillsService()

  const items = ref<JobSkill[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFor(jobId: number) {
    loading.value = true
    error.value = null
    try {
      const all = await service.list()
      items.value = all.filter((item) => item.job_id === jobId)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Diçka shkoi keq. Provo përsëri.'
    } finally {
      loading.value = false
    }
  }

  async function add(jobId: number, skillId: number, importance: SkillImportance) {
    const created = await service.create({ job_id: jobId, skill_id: skillId, importance })
    items.value.push(created)
    return created
  }

  async function remove(id: number) {
    await service.remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loading, error, fetchFor, add, remove }
}
