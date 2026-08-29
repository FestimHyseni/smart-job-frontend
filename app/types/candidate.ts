import type { CandidateProfile } from './candidateProfile'
import type { CandidateLanguage, CandidateSkill, Education, Experience } from './profileExtras'

export interface CandidateResume {
  id: number
  file_name: string
  file_url: string
}

export interface CandidateDetail {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  profile: CandidateProfile | null
  skills: CandidateSkill[]
  experiences: Experience[]
  educations: Education[]
  languages: CandidateLanguage[]
  resumes: CandidateResume[]
}
