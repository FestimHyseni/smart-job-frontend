<script setup lang="ts">
import type { Job } from '~/types/job'

const props = defineProps<{
  job: Job
  saved?: boolean
  showSave?: boolean
}>()

const emit = defineEmits<{
  toggleSave: [jobId: number]
}>()

const authStore = useAuthStore()
const { loading: applying, error: applyError, hasAppliedTo, applyToJob } = useApply()

const alreadyApplied = ref(false)
const applySuccess = ref(false)
const resumeFile = ref<File | null>(null)
const coverLetter = ref('')
const experienceSummary = ref('')

const employmentLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  remote: 'Remote',
}

const canApply = computed(() => authStore.user?.role === 'candidate')

async function loadApplicationState(jobId: number) {
  alreadyApplied.value = false
  applySuccess.value = false
  resumeFile.value = null
  coverLetter.value = ''
  experienceSummary.value = ''
  if (canApply.value) {
    alreadyApplied.value = await hasAppliedTo(jobId)
  }
}

watch(() => props.job.id, (jobId) => loadApplicationState(jobId), { immediate: true })

function onResumeChange(event: Event) {
  resumeFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function onApply() {
  if (!resumeFile.value) return
  try {
    await applyToJob(props.job.id, resumeFile.value, coverLetter.value, experienceSummary.value)
    applySuccess.value = true
  } catch {
    // error state is already handled by useApply
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Header card -->
    <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div class="flex h-16 items-center justify-end bg-gradient-to-r from-brand-600 to-brand-400 px-4">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-extrabold text-white shadow-sm backdrop-blur-sm">
          SJ
        </span>
      </div>
      <div class="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="-mt-2">
          <h1 class="text-2xl font-semibold text-gray-900">{{ job.title }}</h1>
          <NuxtLink
            v-if="job.company_id"
            :to="`/companies/${job.company_id}`"
            class="text-gray-600 hover:text-brand-600 hover:underline"
          >
            {{ job.company?.name }}
          </NuxtLink>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span v-if="job.location">📍 {{ job.location.city }}, {{ job.location.country }}</span>
            <span class="capitalize">{{ job.experience_level }} level</span>
            <span v-if="job.salary_min || job.salary_max">
              💰 {{ job.salary_min }}–{{ job.salary_max }} {{ job.salary_currency }}
            </span>
            <span v-if="job.deadline">⏳ Apply by {{ new Date(job.deadline).toLocaleDateString() }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <span class="whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {{ employmentLabels[job.employment_type] || job.employment_type }}
          </span>
          <button
            v-if="showSave"
            type="button"
            class="flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition"
            :class="saved
              ? 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
              : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'"
            :title="saved ? 'Hiq nga të ruajturat' : 'Ruaj këtë job'"
            @click="emit('toggleSave', job.id)"
          >
            {{ saved ? '✅ Ruajtur' : '🔖 Ruaj' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">📝 Description</h2>
      <p class="whitespace-pre-line text-gray-700">{{ job.description }}</p>
    </div>

    <div v-if="job.requirements" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">✅ Requirements</h2>
      <p class="whitespace-pre-line text-gray-700">{{ job.requirements }}</p>
    </div>

    <div v-if="job.skills?.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">🛠️ Skills</h2>
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

    <div v-if="canApply" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <p v-if="applySuccess" class="text-sm font-medium text-green-600">
        ✓ Your application has been submitted!
      </p>
      <p v-else-if="alreadyApplied" class="text-sm font-medium text-gray-600">
        You have already applied to this job.
      </p>
      <form v-else class="flex flex-col gap-4" @submit.prevent="onApply">
        <h2 class="text-lg font-semibold text-gray-900">Apply for this job</h2>

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
        <BaseTextarea
          v-model="experienceSummary"
          label="Përvoja e punës (opsionale)"
          placeholder="Përshkruaj shkurt përvojën tënde relevante për këtë pozitë..."
        />

        <p v-if="applyError" class="text-sm text-red-600">{{ applyError }}</p>

        <BaseButton type="submit" :loading="applying" :disabled="!resumeFile">Submit application</BaseButton>
      </form>
    </div>
  </div>
</template>
