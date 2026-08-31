import type { CvRecommendationResult } from '~/types/cvRecommendation'
import { useApi } from './api'

export function useCvRecommendationsService() {
  const { request } = useApi()

  function recommend(cv: File) {
    const formData = new FormData()
    formData.append('cv', cv)

    return request<CvRecommendationResult>('/cv-recommendations', {
      method: 'POST',
      body: formData,
    })
  }

  return { recommend }
}
