import type {
  CandidateLanguage,
  CandidateLanguagePayload,
  CandidateSkill,
  CandidateSkillPayload,
  Education,
  EducationPayload,
  Experience,
  ExperiencePayload,
} from '~/types/profileExtras'
import type { Resume } from '~/types/application'
import { useApi } from './api'

export function useExperiencesService() {
  const { request } = useApi()
  return {
    list: () => request<Experience[]>('/experiences'),
    create: (payload: ExperiencePayload) => request<Experience>('/experiences', { method: 'POST', body: payload }),
    update: (id: number, payload: Partial<ExperiencePayload>) =>
      request<Experience>(`/experiences/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) => request<null>(`/experiences/${id}`, { method: 'DELETE' }),
  }
}

export function useEducationsService() {
  const { request } = useApi()
  return {
    list: () => request<Education[]>('/educations'),
    create: (payload: EducationPayload) => request<Education>('/educations', { method: 'POST', body: payload }),
    update: (id: number, payload: Partial<EducationPayload>) =>
      request<Education>(`/educations/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) => request<null>(`/educations/${id}`, { method: 'DELETE' }),
  }
}

export function useCandidateSkillsService() {
  const { request } = useApi()
  return {
    list: () => request<CandidateSkill[]>('/candidate-skills'),
    create: (payload: CandidateSkillPayload) =>
      request<CandidateSkill>('/candidate-skills', { method: 'POST', body: payload }),
    remove: (id: number) => request<null>(`/candidate-skills/${id}`, { method: 'DELETE' }),
  }
}

export function useCandidateLanguagesService() {
  const { request } = useApi()
  return {
    list: () => request<CandidateLanguage[]>('/candidate-languages'),
    create: (payload: CandidateLanguagePayload) =>
      request<CandidateLanguage>('/candidate-languages', { method: 'POST', body: payload }),
    update: (id: number, payload: Partial<CandidateLanguagePayload>) =>
      request<CandidateLanguage>(`/candidate-languages/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) => request<null>(`/candidate-languages/${id}`, { method: 'DELETE' }),
  }
}

export function useResumesService() {
  const { request } = useApi()
  return {
    list: () => request<Resume[]>('/resumes'),
    remove: (id: number) => request<null>(`/resumes/${id}`, { method: 'DELETE' }),
  }
}
