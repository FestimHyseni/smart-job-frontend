import { ApiRequestError } from '~/types/auth'
import type { Application, ApplicationStatus } from '~/types/application'
import type { InterviewPayload } from '~/types/interview'
import type { Job, JobStatus } from '~/types/job'
import { useJobsService } from '~/services/jobs'
import { useApplicationsService } from '~/services/applications'
import { useEmployerService } from '~/services/employer'
import { useInterviewsService } from '~/services/interviews'

const ALL_STATUSES: JobStatus[] = ['draft', 'published', 'closed', 'expired']

export function useEmployerJobs() {
  const jobsService = useJobsService()
  const applicationsService = useApplicationsService()
  const employerService = useEmployerService()
  const interviewsService = useInterviewsService()
  const authStore = useAuthStore()

  const jobs = ref<Job[]>([])
  const applications = ref<Application[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown) {
    error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
  }

  async function fetchMyJobs() {
    loading.value = true
    error.value = null
    try {
      const companyUsers = await employerService.listCompanyUsers()
      const companyId = companyUsers.find((cu) => cu.user_id === authStore.user?.id)?.company_id
      if (!companyId) {
        jobs.value = []
        return
      }
      const batches = await Promise.all(ALL_STATUSES.map((status) => jobsService.list({ status: status as never })))
      jobs.value = batches.flat().filter((job) => job.company_id === companyId)
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  async function togglePublish(job: Job) {
    const nextStatus: JobStatus = job.status === 'published' ? 'closed' : 'published'
    const updated = await jobsService.update(job.id, { status: nextStatus })
    const index = jobs.value.findIndex((j) => j.id === job.id)
    if (index !== -1) jobs.value[index] = updated
    return updated
  }

  async function deleteJob(id: number) {
    await jobsService.remove(id)
    jobs.value = jobs.value.filter((job) => job.id !== id)
  }

  async function fetchApplicationsFor(jobId: number) {
    loading.value = true
    error.value = null
    try {
      applications.value = await applicationsService.list({ job_id: jobId })
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  async function updateApplicationStatus(id: number, status: ApplicationStatus) {
    const updated = await applicationsService.updateStatus(id, status)
    const index = applications.value.findIndex((a) => a.id === id)
    if (index !== -1) applications.value[index] = updated
    return updated
  }

  async function scheduleInterview(payload: InterviewPayload) {
    const interview = await interviewsService.create(payload)
    const application = applications.value.find((a) => a.id === payload.application_id)
    if (application) application.interviews.push(interview)
    return interview
  }

  return {
    jobs,
    applications,
    loading,
    error,
    fetchMyJobs,
    togglePublish,
    deleteJob,
    fetchApplicationsFor,
    updateApplicationStatus,
    scheduleInterview,
  }
}
