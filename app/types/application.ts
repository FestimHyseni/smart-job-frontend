export interface Resume {
  id: number
  user_id: number
  file_name: string
  file_path: string
  file_url: string
  is_default: boolean
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'accepted'

export interface Application {
  id: number
  job_id: number
  candidate_id: number
  resume_id: number
  resume: Resume | null
  cover_letter: string | null
  status: ApplicationStatus
  applied_at: string | null
}
