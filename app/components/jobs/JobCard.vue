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

const employmentLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  remote: 'Remote',
}

const salaryRange = computed(() => {
  const { salary_min, salary_max, salary_currency } = props.job
  if (!salary_min && !salary_max) return null
  const currency = salary_currency || ''
  if (salary_min && salary_max) return `${salary_min} - ${salary_max} ${currency}`
  return `${salary_min || salary_max} ${currency}`
})

function onToggleSave(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  emit('toggleSave', props.job.id)
}
</script>

<template>
  <NuxtLink
    :to="`/jobs/${job.id}`"
    class="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">{{ job.title }}</h2>
        <p class="text-sm text-gray-600">{{ job.company?.name }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {{ employmentLabels[job.employment_type] || job.employment_type }}
        </span>
        <button
          v-if="showSave"
          type="button"
          class="flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="saved
            ? 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
            : 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'"
          :title="saved ? 'Hiq nga të ruajturat' : 'Ruaj këtë job'"
          @click="onToggleSave"
        >
          {{ saved ? '✅ Ruajtur' : '🔖 Ruaj' }}
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
      <span v-if="job.location">📍 {{ job.location.city }}, {{ job.location.country }}</span>
      <span class="capitalize">{{ job.experience_level }} level</span>
      <span v-if="salaryRange">💰 {{ salaryRange }}</span>
    </div>
  </NuxtLink>
</template>
