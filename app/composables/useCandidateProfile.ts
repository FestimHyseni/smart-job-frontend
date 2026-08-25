import { ApiRequestError } from '~/types/auth'
import type { CandidateProfile, CandidateProfilePayload } from '~/types/candidateProfile'
import { useCandidateProfileService } from '~/services/candidateProfile'

export function useCandidateProfile() {
  const profileService = useCandidateProfileService()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})

  function handleError(err: unknown) {
    if (err instanceof ApiRequestError) {
      error.value = err.message
      fieldErrors.value = err.errors ?? {}
    } else {
      error.value = 'Something went wrong. Please try again.'
      fieldErrors.value = {}
    }
  }

  async function fetchMyProfile(): Promise<CandidateProfile | null> {
    loading.value = true
    error.value = null
    try {
      const profiles = await profileService.list()
      return profiles.find((profile) => profile.user_id === authStore.user?.id) ?? null
    } catch (err) {
      handleError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(existing: CandidateProfile | null, payload: CandidateProfilePayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      if (existing) {
        return await profileService.update(existing.id, payload)
      }
      return await profileService.create({ ...payload, user_id: authStore.user?.id })
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fieldErrors, fetchMyProfile, saveProfile }
}
