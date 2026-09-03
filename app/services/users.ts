import type { CreateUserPayload, UpdateUserPayload, User } from '~/types/user'
import { useApi } from './api'

export function useUsersService() {
  const { request } = useApi()

  function list() {
    return request<User[]>('/users')
  }

  function show(id: number) {
    return request<User>(`/users/${id}`)
  }

  function create(payload: CreateUserPayload) {
    return request<User>('/users', {
      method: 'POST',
      body: payload,
    })
  }

  function update(id: number, payload: UpdateUserPayload) {
    return request<User>(`/users/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  function remove(id: number) {
    return request<null>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, show, create, update, remove }
}
