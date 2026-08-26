export interface Experience {
  id: number
  user_id: number
  company_name: string
  position: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
}

export interface ExperiencePayload {
  user_id?: number
  company_name: string
  position: string
  description?: string | null
  start_date: string
  end_date?: string | null
  is_current?: boolean
}

export interface Education {
  id: number
  user_id: number
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  description: string | null
}

export interface EducationPayload {
  user_id?: number
  institution: string
  degree: string
  field: string
  start_date: string
  end_date?: string | null
  description?: string | null
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Skill {
  id: number
  name: string
}

export interface CandidateSkill {
  id: number
  user_id: number
  skill_id: number
  skill: Skill | null
  level: SkillLevel
  verified: boolean
}

export interface CandidateSkillPayload {
  user_id?: number
  skill_id: number
  level: SkillLevel
}

export type LanguageProficiency = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export interface CandidateLanguage {
  id: number
  user_id: number
  name: string
  speaking: LanguageProficiency
  writing: LanguageProficiency
  listening: LanguageProficiency
  understanding: LanguageProficiency
}

export interface CandidateLanguagePayload {
  user_id?: number
  name: string
  speaking: LanguageProficiency
  writing: LanguageProficiency
  listening: LanguageProficiency
  understanding: LanguageProficiency
}
