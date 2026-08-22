import type { AuthResult, LoginPayload, RegisterPayload } from '~/types/auth'
import { useApi } from './api'

export function useAuthService() {
  const { request } = useApi()

  function login(payload: LoginPayload) {
    return request<AuthResult>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  }

  function register(payload: RegisterPayload) {
    return request<AuthResult>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  }

  return { login, register }
}
