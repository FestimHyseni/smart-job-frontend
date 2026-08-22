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
