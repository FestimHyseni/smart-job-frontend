import type { Job } from './job'

export interface RecommendedJob extends Job {
  match_score: number
}

export interface CvRecommendationResult {
  matched_skills: string[]
  jobs: RecommendedJob[]
}
