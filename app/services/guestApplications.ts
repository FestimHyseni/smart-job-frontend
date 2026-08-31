import type { Application } from '~/types/application'
import { useApi } from './api'

export interface GuestApplicationPayload {
  job_id: number
  first_name: string
  last_name: string
  email: string
  resume: File
  cover_letter?: string
  experience_summary?: string
}

export function useGuestApplicationsService() {
  const { request } = useApi()

  function apply(payload: GuestApplicationPayload) {
    const formData = new FormData()
    formData.append('job_id', String(payload.job_id))
    formData.append('first_name', payload.first_name)
    formData.append('last_name', payload.last_name)
    formData.append('email', payload.email)
    formData.append('resume', payload.resume)
    if (payload.cover_letter) formData.append('cover_letter', payload.cover_letter)
    if (payload.experience_summary) formData.append('experience_summary', payload.experience_summary)

    return request<Application>('/guest-applications', {
      method: 'POST',
      body: formData,
    })
  }

  return { apply }
}
