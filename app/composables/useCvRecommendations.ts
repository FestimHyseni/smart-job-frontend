import { ApiRequestError } from '~/types/auth'
import type { CvRecommendationResult } from '~/types/cvRecommendation'
import { useCvRecommendationsService } from '~/services/cvRecommendations'

export function useCvRecommendations() {
  const service = useCvRecommendationsService()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<CvRecommendationResult | null>(null)

  async function analyze(cv: File) {
    loading.value = true
    error.value = null
    try {
      result.value = await service.recommend(cv)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Diçka shkoi keq. Provo përsëri.'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    result.value = null
    error.value = null
  }

  return { loading, error, result, analyze, reset }
}
