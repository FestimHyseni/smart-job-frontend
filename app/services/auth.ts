import type { AuthResult, LoginPayload, RegisterPayload } from '~/types/auth'
import type { User } from '~/types/user'
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

  function logout() {
    return request<null>('/auth/logout', {
      method: 'POST',
    })
  }

  function updateAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    return request<User>('/auth/avatar', {
      method: 'POST',
      body: formData,
    })
  }

  return { login, register, logout, updateAvatar }
}
