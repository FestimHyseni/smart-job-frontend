<script setup lang="ts">
import type { JobCategory, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

const { jobs, loading, error, fetchJobs } = useJobs()
const catalogService = useCatalogService()

const categories = ref<JobCategory[]>([])
const locations = ref<Location[]>([])

const filters = reactive({
  search: '',
  category_id: '',
  location_id: '',
  employment_type: '',
})

function applyFilters() {
  fetchJobs({
    search: filters.search || undefined,
    category_id: filters.category_id ? Number(filters.category_id) : undefined,
    location_id: filters.location_id ? Number(filters.location_id) : undefined,
    employment_type: (filters.employment_type || undefined) as never,
  })
}

onMounted(async () => {
  const [categoriesResult, locationsResult] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listLocations(),
  ])
  categories.value = categoriesResult
  locations.value = locationsResult
  await fetchJobs()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Jobs</h1>

      <form class="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4" @submit.prevent="applyFilters">
        <BaseInput v-model="filters.search" label="Search" placeholder="Job title" />
        <BaseSelect
          v-model="filters.category_id"
          label="Category"
          placeholder="All categories"
          :options="categories.map((c) => ({ value: c.id, label: c.name }))"
        />
        <BaseSelect
          v-model="filters.location_id"
          label="Location"
          placeholder="All locations"
          :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
        />
        <BaseSelect
          v-model="filters.employment_type"
          label="Employment type"
          placeholder="All types"
          :options="[
            { value: 'full_time', label: 'Full-time' },
            { value: 'part_time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' },
            { value: 'remote', label: 'Remote' },
          ]"
        />
        <div class="sm:col-span-4">
          <BaseButton type="submit">Filter</BaseButton>
        </div>
      </form>

      <p v-if="loading" class="text-sm text-gray-600">Loading jobs...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!jobs.length" class="text-sm text-gray-600">No jobs found.</p>

      <div v-else class="flex flex-col gap-4">
        <JobCard v-for="job in jobs" :key="job.id" :job="job" />
      </div>
    </div>
  </div>
</template>
