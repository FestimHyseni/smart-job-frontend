import type { Application } from '~/types/application'
import type { Resume } from '~/types/application'
import { useApi } from './api'

export function useApplicationsService() {
  const { request } = useApi()

  function list() {
    return request<Application[]>('/applications')
  }

  function apply(payload: { job_id: number; candidate_id: number; resume_id: number; cover_letter?: string }) {
    return request<Application>('/applications', {
      method: 'POST',
      body: payload,
    })
  }

  function uploadResume(userId: number, file: File) {
    const formData = new FormData()
    formData.append('user_id', String(userId))
    formData.append('file', file)

    return request<Resume>('/resumes', {
      method: 'POST',
      body: formData,
    })
  }

  return { list, apply, uploadResume }
}
