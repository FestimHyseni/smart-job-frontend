import type { JobSkill, JobSkillPayload } from '~/types/jobSkill'
import { useApi } from './api'

export function useJobSkillsService() {
  const { request } = useApi()

  function list() {
    return request<JobSkill[]>('/job-skills', {
      params: { per_page: 100 },
    })
  }

  function create(payload: JobSkillPayload) {
    return request<JobSkill>('/job-skills', {
      method: 'POST',
      body: payload,
    })
  }

  function remove(id: number) {
    return request<null>(`/job-skills/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, create, remove }
}
