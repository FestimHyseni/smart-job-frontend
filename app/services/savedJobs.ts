import type { SavedJob } from '~/types/savedJob'
import { useApi } from './api'

export function useSavedJobsService() {
  const { request } = useApi()

  function list() {
    return request<SavedJob[]>('/saved-jobs')
  }

  function save(userId: number, jobId: number) {
    return request<SavedJob>('/saved-jobs', {
      method: 'POST',
      body: { user_id: userId, job_id: jobId },
    })
  }

  function remove(id: number) {
    return request<null>(`/saved-jobs/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, save, remove }
}
