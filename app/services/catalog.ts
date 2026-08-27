import type { Company, JobCategory, Location } from '~/types/job'
import type { Skill } from '~/types/profileExtras'
import { useApi } from './api'

export function useCatalogService() {
  const { request } = useApi()

  function listCategories() {
    return request<JobCategory[]>('/job-categories')
  }

  function listLocations() {
    return request<Location[]>('/locations')
  }

  function listSkills() {
    return request<Skill[]>('/skills')
  }

  function showCompany(id: number) {
    return request<Company>(`/companies/${id}`)
  }

  return { listCategories, listLocations, listSkills, showCompany }
}
