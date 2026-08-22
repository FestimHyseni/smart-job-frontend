import type { User, UserRole } from './user'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: Extract<UserRole, 'employer' | 'candidate'>
  phone?: string
}

export interface AuthResult {
  user: User
  token: string
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors: Record<string, string[]> | null
}

export class ApiRequestError extends Error {
  errors: Record<string, string[]> | null

  constructor(message: string, errors: Record<string, string[]> | null = null) {
    super(message)
    this.name = 'ApiRequestError'
    this.errors = errors
  }
}
