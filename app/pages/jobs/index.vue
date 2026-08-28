<script setup lang="ts">
import type { JobCategory, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

const { jobs, loading, error, fetchJobs } = useJobs()
const catalogService = useCatalogService()
const authStore = useAuthStore()
const savedJobs = useSavedJobs()

const canSave = computed(() => authStore.user?.role === 'candidate')

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
  if (canSave.value) await savedJobs.fetchMine()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 px-4 py-14 text-center">
      <h1 class="text-3xl font-extrabold text-white sm:text-4xl">Gjej punën tënde të ardhshme</h1>
      <p class="mx-auto mt-2 max-w-xl text-brand-100">
        Mijëra shpallje pune nga kompani të vërteta — filtro, apliko, dhe ndiq statusin tënd në një vend.
      </p>
    </div>

    <div class="mx-auto max-w-4xl px-4 py-10">
      <form class="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-4" @submit.prevent="applyFilters">
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
        <JobCard
          v-for="job in jobs"
          :key="job.id"
          :job="job"
          :show-save="canSave"
          :saved="savedJobs.isSaved(job.id)"
          @toggle-save="savedJobs.toggle"
        />
      </div>
    </div>
  </div>
</template>
