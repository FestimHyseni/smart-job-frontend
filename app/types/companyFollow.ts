import type { Company } from './job'

export interface CompanyFollow {
  id: number
  user_id: number
  company_id: number
  company: Company | null
  created_at: string
}
