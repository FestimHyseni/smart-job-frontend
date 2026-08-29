import type { Job, JobFilters, JobPayload, JobViewStats } from '~/types/job'
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

  function viewStats(id: number) {
    return request<JobViewStats>(`/jobs/${id}/view-stats`)
  }

  function create(payload: JobPayload) {
    return request<Job>('/jobs', {
      method: 'POST',
      body: payload,
    })
  }

  function update(id: number, payload: Partial<JobPayload>) {
    return request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  function remove(id: number) {
    return request<null>(`/jobs/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, show, viewStats, create, update, remove }
}
