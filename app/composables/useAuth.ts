import { ApiRequestError, type LoginPayload, type RegisterPayload } from '~/types/auth'
import { useAuthService } from '~/services/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const authService = useAuthService()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})

  function handleError(err: unknown) {
    if (err instanceof ApiRequestError) {
      error.value = err.message
      fieldErrors.value = err.errors ?? {}
    } else {
      error.value = 'Diçka shkoi keq. Provo përsëri.'
      fieldErrors.value = {}
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      const result = await authService.login(payload)
      authStore.setSession(result.user, result.token)
      return result
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      const result = await authService.register(payload)
      authStore.setSession(result.user, result.token)
      return result
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      authStore.clearSession()
    }
  }

  async function updateAvatar(file: File) {
    loading.value = true
    error.value = null
    try {
      const user = await authService.updateAvatar(file)
      if (authStore.token) authStore.setSession(user, authStore.token)
      return user
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { login, register, logout, updateAvatar, loading, error, fieldErrors }
}
