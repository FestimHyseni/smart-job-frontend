import type { Job, JobFilters } from '~/types/job'
import { useApi } from './api'

export function useJobsService() {
  const { request } = useApi()

  function list(filters: JobFilters = {}) {
    return request<Job[]>('/jobs', {
      params: filters,
    })
  }

  function show(id: number) {
    return request<Job>(`/jobs/${id}`)
  }

  return { list, show }
}
