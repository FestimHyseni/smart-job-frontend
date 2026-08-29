<script setup lang="ts">
import type { Job } from '~/types/job'

const route = useRoute()
const jobId = Number(route.params.id)

const { loading, error, fetchJob } = useJobs()
const authStore = useAuthStore()
const { loading: applying, error: applyError, hasAppliedTo, applyToJob } = useApply()
const savedJobs = useSavedJobs()

const job = ref<Job | null>(null)
const alreadyApplied = ref(false)
const applySuccess = ref(false)
const resumeFile = ref<File | null>(null)
const coverLetter = ref('')

const employmentLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  remote: 'Remote',
}

const canApply = computed(() => authStore.user?.role === 'candidate')

onMounted(async () => {
  try {
    job.value = await fetchJob(jobId)
  } catch {
    // error state is already handled by useJobs
  }
  if (canApply.value) {
    alreadyApplied.value = await hasAppliedTo(jobId)
    await savedJobs.fetchMine()
  }
})

function onResumeChange(event: Event) {
  resumeFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function onApply() {
  if (!resumeFile.value) return
  try {
    await applyToJob(jobId, resumeFile.value, coverLetter.value)
    applySuccess.value = true
  } catch {
    // error state is already handled by useApply
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/jobs" class="mb-6 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Back to jobs
      </NuxtLink>

      <p v-if="loading" class="text-sm text-gray-600">Loading job...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div v-else-if="job" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ job.title }}</h1>
            <NuxtLink
              v-if="job.company_id"
              :to="`/companies/${job.company_id}`"
              class="text-gray-600 hover:text-brand-600 hover:underline"
            >
              {{ job.company?.name }}
            </NuxtLink>
          </div>
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {{ employmentLabels[job.employment_type] || job.employment_type }}
            </span>
            <button
              v-if="canApply"
              type="button"
              class="flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition"
              :class="savedJobs.isSaved(job.id)
                ? 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
                : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'"
              :title="savedJobs.isSaved(job.id) ? 'Hiq nga të ruajturat' : 'Ruaj këtë job'"
              @click="savedJobs.toggle(job.id)"
            >
              {{ savedJobs.isSaved(job.id) ? '✅ Ruajtur' : '🔖 Ruaj' }}
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span v-if="job.location">📍 {{ job.location.city }}, {{ job.location.country }}</span>
          <span class="capitalize">{{ job.experience_level }} level</span>
          <span v-if="job.salary_min || job.salary_max">
            💰 {{ job.salary_min }}–{{ job.salary_max }} {{ job.salary_currency }}
          </span>
          <span v-if="job.deadline">⏳ Apply by {{ new Date(job.deadline).toLocaleDateString() }}</span>
        </div>

        <div class="mt-6">
          <h2 class="mb-2 text-lg font-medium text-gray-900">Description</h2>
          <p class="whitespace-pre-line text-gray-700">{{ job.description }}</p>
        </div>

        <div v-if="job.requirements" class="mt-6">
          <h2 class="mb-2 text-lg font-medium text-gray-900">Requirements</h2>
          <p class="whitespace-pre-line text-gray-700">{{ job.requirements }}</p>
        </div>

        <div v-if="job.skills?.length" class="mt-6">
          <h2 class="mb-2 text-lg font-medium text-gray-900">Skills</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in job.skills"
              :key="skill.id"
              class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
            >
              {{ skill.name }}
            </span>
          </div>
        </div>

        <div v-if="canApply" class="mt-8 border-t border-gray-200 pt-6">
          <p v-if="applySuccess" class="text-sm font-medium text-green-600">
            Your application has been submitted!
          </p>
          <p v-else-if="alreadyApplied" class="text-sm font-medium text-gray-600">
            You have already applied to this job.
          </p>
          <form v-else class="flex flex-col gap-3" @submit.prevent="onApply">
            <h2 class="text-lg font-medium text-gray-900">Apply for this job</h2>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Resume (PDF or Word)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                class="text-sm"
                @change="onResumeChange"
              >
            </div>

            <BaseTextarea v-model="coverLetter" label="Cover letter (optional)" placeholder="Why are you a good fit?" />

            <p v-if="applyError" class="text-sm text-red-600">{{ applyError }}</p>

            <BaseButton type="submit" :loading="applying" :disabled="!resumeFile">Submit application</BaseButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
