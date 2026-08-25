import type { JobCategory, Location } from '~/types/job'
import { useApi } from './api'

export function useCatalogService() {
  const { request } = useApi()

  function listCategories() {
    return request<JobCategory[]>('/job-categories')
  }

  function listLocations() {
    return request<Location[]>('/locations')
  }

  return { listCategories, listLocations }
}
