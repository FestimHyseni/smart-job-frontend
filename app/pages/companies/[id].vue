<script setup lang="ts">
import type { Company } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

const route = useRoute()
const companyId = Number(route.params.id)

const catalogService = useCatalogService()
const { jobs, loading, error, fetchJobs } = useJobs()

const company = ref<Company | null>(null)
const companyLoading = ref(true)
const companyError = ref<string | null>(null)

onMounted(async () => {
  try {
    company.value = await catalogService.showCompany(companyId)
  } catch {
    companyError.value = 'Company not found.'
  } finally {
    companyLoading.value = false
  }
  await fetchJobs({ company_id: companyId })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/jobs" class="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline">
        ← Back to jobs
      </NuxtLink>

      <p v-if="companyLoading" class="text-sm text-gray-600">Loading company...</p>
      <p v-else-if="companyError" class="text-sm text-red-600">{{ companyError }}</p>

      <template v-else-if="company">
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h1 class="text-2xl font-semibold text-gray-900">{{ company.name }}</h1>
          <p v-if="company.location" class="mt-1 text-sm text-gray-500">
            📍 {{ company.location.city }}, {{ company.location.country }}
          </p>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span v-if="company.industry">🏭 {{ company.industry }}</span>
            <span v-if="company.employees_count">👥 {{ company.employees_count }} employees</span>
            <a v-if="company.website" :href="company.website" target="_blank" class="text-blue-600 hover:underline">
              🔗 {{ company.website }}
            </a>
          </div>
          <p class="mt-4 whitespace-pre-line text-gray-700">{{ company.description }}</p>
        </div>

        <h2 class="mb-4 mt-8 text-lg font-semibold text-gray-900">Job-et e hapura</h2>

        <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
        <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-else-if="!jobs.length" class="text-sm text-gray-500">Kjo kompani s'ka ende job-e të hapura.</p>

        <div v-else class="flex flex-col gap-4">
          <JobCard v-for="job in jobs" :key="job.id" :job="job" />
        </div>
      </template>
    </div>
  </div>
</template>
