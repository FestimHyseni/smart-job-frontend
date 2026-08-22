import { defineStore } from 'pinia'
import type { User } from '~/types/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setSession(user: User, token: string) {
      this.user = user
      this.token = token
    },
    clearSession() {
      this.user = null
      this.token = null
    },
  },
})
