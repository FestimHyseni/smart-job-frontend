import type { CandidateProfile, CandidateProfilePayload } from '~/types/candidateProfile'
import { useApi } from './api'

export function useCandidateProfileService() {
  const { request } = useApi()

  function list() {
    return request<CandidateProfile[]>('/candidate-profiles')
  }

  function create(payload: CandidateProfilePayload) {
    return request<CandidateProfile>('/candidate-profiles', {
      method: 'POST',
      body: payload,
    })
  }

  function update(id: number, payload: Partial<CandidateProfilePayload>) {
    return request<CandidateProfile>(`/candidate-profiles/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  return { list, create, update }
}
