import type { Application, ApplicationStatus, Resume } from '~/types/application'
import { useApi } from './api'

export function useApplicationsService() {
  const { request } = useApi()

  function list(filters: { candidate_id?: number; job_id?: number; status?: ApplicationStatus; per_page?: number } = {}) {
    return request<Application[]>('/applications', {
      params: filters,
    })
  }

  function apply(payload: {
    job_id: number
    candidate_id: number
    resume_id: number
    cover_letter?: string
    experience_summary?: string
  }) {
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

  function updateStatus(id: number, status: ApplicationStatus) {
    return request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: { status },
    })
  }

  return { list, apply, uploadResume, updateStatus }
}
