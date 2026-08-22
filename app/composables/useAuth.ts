import type { LoginPayload, RegisterPayload } from '~/types/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const authService = useAuthService()

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const result = await authService.login(payload)
      authStore.setSession(result.user, result.token)
      return result
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const result = await authService.register(payload)
      authStore.setSession(result.user, result.token)
      return result
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { login, register, loading, error }
}
