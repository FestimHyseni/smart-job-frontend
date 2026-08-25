import { ApiRequestError } from '~/types/auth'
import type { Job, JobFilters } from '~/types/job'
import { useJobsService } from '~/services/jobs'

export function useJobs() {
  const jobsService = useJobsService()

  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchJobs(filters: JobFilters = {}) {
    loading.value = true
    error.value = null
    try {
      jobs.value = await jobsService.list(filters)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
    } finally {
      loading.value = false
    }
  }

  async function fetchJob(id: number) {
    loading.value = true
    error.value = null
    try {
      return await jobsService.show(id)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { jobs, loading, error, fetchJobs, fetchJob }
}
