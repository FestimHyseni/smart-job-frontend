<script setup lang="ts">
import type { Job } from '~/types/job'

const route = useRoute()
const jobId = Number(route.params.id)

const { loading, error, fetchJob } = useJobs()
const job = ref<Job | null>(null)

const employmentLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  remote: 'Remote',
}

onMounted(async () => {
  try {
    job.value = await fetchJob(jobId)
  } catch {
    // error state is already handled by useJobs
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/jobs" class="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline">
        ← Back to jobs
      </NuxtLink>

      <p v-if="loading" class="text-sm text-gray-600">Loading job...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div v-else-if="job" class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ job.title }}</h1>
            <p class="text-gray-600">{{ job.company?.name }}</p>
          </div>
          <span class="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {{ employmentLabels[job.employment_type] || job.employment_type }}
          </span>
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
      </div>
    </div>
  </div>
</template>
