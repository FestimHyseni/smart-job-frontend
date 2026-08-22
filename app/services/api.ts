import type { ApiError, ApiSuccess } from '~/types/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const client = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (authStore.token) {
        options.headers.set('Authorization', `Bearer ${authStore.token}`)
      }
    },
  })

  async function request<T>(...args: Parameters<typeof client>): Promise<ApiSuccess<T>['data']> {
    try {
      const response = await client<ApiSuccess<T>>(...args)
      return response.data
    } catch (error) {
      const apiError = (error as { data?: ApiError }).data
      throw new Error(apiError?.message || 'Something went wrong. Please try again.')
    }
  }

  return { request }
}
