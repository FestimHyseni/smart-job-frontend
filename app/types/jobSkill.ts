import type { Skill } from './profileExtras'

export type SkillImportance = 'required' | 'preferred'

export interface JobSkill {
  id: number
  job_id: number
  skill_id: number
  skill: Skill | null
  importance: SkillImportance
}

export interface JobSkillPayload {
  job_id: number
  skill_id: number
  importance: SkillImportance
}
