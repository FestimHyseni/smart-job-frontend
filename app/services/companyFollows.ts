import type { CompanyFollow } from '~/types/companyFollow'
import { useApi } from './api'

export function useCompanyFollowsService() {
  const { request } = useApi()

  function list() {
    return request<CompanyFollow[]>('/company-follows')
  }

  function follow(userId: number, companyId: number) {
    return request<CompanyFollow>('/company-follows', {
      method: 'POST',
      body: { user_id: userId, company_id: companyId },
    })
  }

  function unfollow(id: number) {
    return request<null>(`/company-follows/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, follow, unfollow }
}
