import type { Location } from './job'
import type { User } from './user'

export interface CandidateProfile {
  id: number
  user_id: number
  user: User | null
  headline: string
  bio: string
  location_id: number
  location: Location | null
  years_experience: number
  expected_salary: number
  salary_currency: string
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
}

export interface CandidateProfilePayload {
  user_id?: number
  headline: string
  bio: string
  location_id: number
  years_experience: number
  expected_salary: number
  salary_currency: string
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
}
