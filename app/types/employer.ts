import type { Company } from './job'

export interface CompanyUser {
  id: number
  company_id: number
  company: Company | null
  user_id: number
  role: 'owner' | 'recruiter'
}

export interface CompanyPayload {
  name: string
  description: string
  logo?: string | null
  website?: string | null
  location_id: number
  industry: string
  employees_count?: number | null
}
