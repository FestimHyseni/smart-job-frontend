import type { Job } from './job'

export interface SavedJob {
  id: number
  user_id: number
  job_id: number
  job: Job | null
  created_at: string
}
