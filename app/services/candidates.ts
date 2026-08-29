import type { CandidateDetail } from '~/types/candidate'
import { useApi } from './api'

export function useCandidatesService() {
  const { request } = useApi()

  function show(id: number) {
    return request<CandidateDetail>(`/candidates/${id}`)
  }

  return { show }
}
