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
    companyError.value = 'Kompania nuk u gjet.'
  } finally {
    companyLoading.value = false
  }
  await fetchJobs({ company_id: companyId })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <div class="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-8">
      <NuxtLink to="/jobs" class="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        ← Të gjitha job-et
      </NuxtLink>

      <p v-if="companyLoading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="companyError" class="text-sm text-red-600">{{ companyError }}</p>

      <template v-else-if="company">
        <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div class="h-16 bg-gradient-to-r from-brand-600 to-brand-400" />
          <div class="flex items-center gap-4 px-6 pb-5">
            <div class="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-brand-50 text-2xl shadow">
              🏢
            </div>
            <div class="pt-1">
              <h1 class="text-xl font-semibold text-gray-900">{{ company.name }}</h1>
              <p v-if="company.location" class="text-sm text-gray-500">
                📍 {{ company.location.city }}, {{ company.location.country }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span v-if="company.industry">🏭 {{ company.industry }}</span>
            <span v-if="company.employees_count">👥 {{ company.employees_count }} punonjës</span>
            <a v-if="company.website" :href="company.website" target="_blank" class="text-brand-600 hover:underline">
              🔗 {{ company.website }}
            </a>
          </div>
          <p v-if="company.description" class="mt-4 whitespace-pre-line text-gray-700">{{ company.description }}</p>
        </div>

        <div>
          <h2 class="mb-4 text-lg font-semibold text-gray-900">Job-et e hapura</h2>

          <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
          <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
          <p v-else-if="!jobs.length" class="text-sm text-gray-500">Kjo kompani s'ka ende job-e të hapura.</p>

          <div v-else class="flex flex-col gap-4">
            <JobCard v-for="job in jobs" :key="job.id" :job="job" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
