import { ApiRequestError } from '~/types/auth'
import type { Job, JobFilters, JobPayload } from '~/types/job'
import { useJobsService } from '~/services/jobs'

export function useJobs() {
  const jobsService = useJobsService()

  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})

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

  async function createJob(payload: JobPayload) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await jobsService.create(payload)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.message
        fieldErrors.value = err.errors ?? {}
      } else {
        error.value = 'Something went wrong. Please try again.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateJob(id: number, payload: Partial<JobPayload>) {
    loading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await jobsService.update(id, payload)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.message
        fieldErrors.value = err.errors ?? {}
      } else {
        error.value = 'Something went wrong. Please try again.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return { jobs, loading, error, fieldErrors, fetchJobs, fetchJob, createJob, updateJob }
}
