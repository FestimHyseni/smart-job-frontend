export interface Location {
  id: number
  city: string
  country: string
}

export interface JobCategory {
  id: number
  name: string
}

export interface Company {
  id: number
  name: string
  description: string
  logo: string | null
  website: string | null
  location_id: number
  location: Location | null
  industry: string
  employees_count: number | null
}

export interface Skill {
  id: number
  name: string
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'
export type JobStatus = 'draft' | 'published' | 'closed' | 'expired'

export interface Job {
  id: number
  company_id: number
  company: Company | null
  category_id: number
  category: JobCategory | null
  title: string
  description: string
  requirements: string | null
  location_id: number
  location: Location | null
  employment_type: EmploymentType
  experience_level: ExperienceLevel
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  status: JobStatus
  deadline: string | null
  skills: Skill[]
  created_at: string
  updated_at: string
}

export interface JobFilters {
  search?: string
  category_id?: number
  location_id?: number
  employment_type?: EmploymentType
  experience_level?: ExperienceLevel
}
