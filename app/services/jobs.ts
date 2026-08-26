import type { Job, JobFilters, JobPayload } from '~/types/job'
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

  function create(payload: JobPayload) {
    return request<Job>('/jobs', {
      method: 'POST',
      body: payload,
    })
  }

  return { list, show, create }
}
