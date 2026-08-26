import { ApiRequestError } from '~/types/auth'
import type { Company } from '~/types/job'
import type { CompanyPayload } from '~/types/employer'
import { useEmployerService } from '~/services/employer'

export function useEmployerCompany() {
  const employerService = useEmployerService()
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

  async function fetchMyCompany(): Promise<Company | null> {
    loading.value = true
    error.value = null
    try {
      const companyUsers = await employerService.listCompanyUsers()
      const mine = companyUsers.find((cu) => cu.user_id === authStore.user?.id)
      return mine?.company ?? null
    } catch (err) {
      handleError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function saveCompany(existing: Company | null, payload: CompanyPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      if (existing) {
        return await employerService.updateCompany(existing.id, payload)
      }
      const company = await employerService.createCompany(payload)
      await employerService.linkCompanyUser(company.id, authStore.user!.id)
      return company
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fieldErrors, fetchMyCompany, saveCompany }
}
