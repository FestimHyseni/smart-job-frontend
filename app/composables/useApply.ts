import { ApiRequestError } from '~/types/auth'
import { useApplicationsService } from '~/services/applications'
import { useResumesService } from '~/services/profileExtras'

export function useApply() {
  const applicationsService = useApplicationsService()
  const resumesService = useResumesService()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  function handleError(err: unknown) {
    if (err instanceof ApiRequestError) {
      const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined
      error.value = firstFieldError ?? err.message
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
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

  async function applyToJob(
    jobId: number,
    resumeFile: File,
    coverLetter: string,
    experienceSummary: string,
    languages: string,
  ) {
    loading.value = true
    error.value = null
    try {
      const userId = authStore.user!.id
      const myResumes = await resumesService.list()
      const existing = myResumes.find((r) => r.user_id === userId && r.file_name === resumeFile.name)
      const resume = existing ?? await applicationsService.uploadResume(userId, resumeFile)
      return await applicationsService.apply({
        job_id: jobId,
        candidate_id: userId,
        resume_id: resume.id,
        cover_letter: coverLetter || undefined,
        experience_summary: experienceSummary || undefined,
        languages: languages || undefined,
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
