import type { Interview, InterviewPayload } from '~/types/interview'
import { useApi } from './api'

export function useInterviewsService() {
  const { request } = useApi()

  function create(payload: InterviewPayload) {
    return request<Interview>('/interviews', {
      method: 'POST',
      body: payload,
    })
  }

  return { create }
}
