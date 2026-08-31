import { ApiRequestError } from '~/types/auth'
import type { CreateUserPayload, UpdateUserPayload, User } from '~/types/user'
import { useUsersService } from '~/services/users'

export function useUsers() {
  const usersService = useUsersService()

  const users = ref<User[]>([])
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

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      users.value = await usersService.list()
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: number) {
    loading.value = true
    error.value = null
    try {
      return await usersService.show(id)
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: CreateUserPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await usersService.create(payload)
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, payload: UpdateUserPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await usersService.update(id, payload)
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { users, loading, error, fieldErrors, fetchUsers, fetchUser, createUser, updateUser }
}
