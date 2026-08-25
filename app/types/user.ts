export type UserRole = 'admin' | 'employer' | 'candidate'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone: string | null
  avatar: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  phone?: string | null
}
