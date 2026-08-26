import type { Company } from '~/types/job'
import type { CompanyPayload, CompanyUser } from '~/types/employer'
import { useApi } from './api'

export function useEmployerService() {
  const { request } = useApi()

  function listCompanyUsers() {
    return request<CompanyUser[]>('/company-users')
  }

  function createCompany(payload: CompanyPayload) {
    return request<Company>('/companies', {
      method: 'POST',
      body: payload,
    })
  }

  function updateCompany(id: number, payload: Partial<CompanyPayload>) {
    return request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  function linkCompanyUser(companyId: number, userId: number) {
    return request<CompanyUser>('/company-users', {
      method: 'POST',
      body: { company_id: companyId, user_id: userId, role: 'owner' },
    })
  }

  return { listCompanyUsers, createCompany, updateCompany, linkCompanyUser }
}
