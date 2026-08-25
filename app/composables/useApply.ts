import { ApiRequestError } from '~/types/auth'
import { useApplicationsService } from '~/services/applications'

export function useApply() {
  const applicationsService = useApplicationsService()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown) {
    error.value = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.'
  }

  async function hasAppliedTo(jobId: number): Promise<boolean> {
    try {
      const applications = await applicationsService.list()
      return applications.some(
        (application) => application.job_id === jobId && application.candidate_id === authStore.user?.id,
      )
    } catch {
      return false
    }
  }

  async function applyToJob(jobId: number, resumeFile: File, coverLetter: string) {
    loading.value = true
    error.value = null
    try {
      const userId = authStore.user!.id
      const resume = await applicationsService.uploadResume(userId, resumeFile)
      return await applicationsService.apply({
        job_id: jobId,
        candidate_id: userId,
        resume_id: resume.id,
        cover_letter: coverLetter || undefined,
      })
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, hasAppliedTo, applyToJob }
}
