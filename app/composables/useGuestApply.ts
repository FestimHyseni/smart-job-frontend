import { ApiRequestError } from '~/types/auth'
import { useGuestApplicationsService, type GuestApplicationPayload } from '~/services/guestApplications'

export function useGuestApply() {
  const service = useGuestApplicationsService()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})

  async function applyAsGuest(payload: GuestApplicationPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await service.apply(payload)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.message
        fieldErrors.value = err.errors ?? {}
      } else {
        error.value = 'Diçka shkoi keq. Provo përsëri.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fieldErrors, applyAsGuest }
}
