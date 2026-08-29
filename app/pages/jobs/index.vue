<script setup lang="ts">
import type { Job, JobCategory, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'
import { useJobsService } from '~/services/jobs'

const { jobs, loading, error, fetchJobs } = useJobs()
const jobsService = useJobsService()
const catalogService = useCatalogService()
const authStore = useAuthStore()
const savedJobs = useSavedJobs()

const canSave = computed(() => authStore.user?.role === 'candidate')

const categories = ref<JobCategory[]>([])
const locations = ref<Location[]>([])
const selectedJob = ref<Job | null>(null)

const filters = reactive({
  search: '',
  category_id: '',
  location_id: '',
  employment_type: '',
})

async function applyFilters() {
  await fetchJobs({
    search: filters.search || undefined,
    category_id: filters.category_id ? Number(filters.category_id) : undefined,
    location_id: filters.location_id ? Number(filters.location_id) : undefined,
    employment_type: (filters.employment_type || undefined) as never,
  })
  selectedJob.value = jobs.value[0] ?? null
}

async function selectJob(job: Job) {
  selectedJob.value = job
  try {
    selectedJob.value = await jobsService.show(job.id)
  } catch {
    // keep the already-known job data if the refetch fails
  }
}

function closeDetail() {
  selectedJob.value = null
}

onMounted(async () => {
  const [categoriesResult, locationsResult] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listLocations(),
  ])
  categories.value = categoriesResult
  locations.value = locationsResult
  await fetchJobs()
  selectedJob.value = jobs.value[0] ?? null
  if (canSave.value) await savedJobs.fetchMine()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="border-b border-gray-100 bg-white px-4 py-4">
      <form class="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-4 lg:grid-cols-5" @submit.prevent="applyFilters">
        <BaseInput v-model="filters.search" label="Kërko sipas pozitës së punës" placeholder="Job title" />
        <BaseSelect
          v-model="filters.category_id"
          label="Industria"
          placeholder="Të gjitha"
          :options="categories.map((c) => ({ value: c.id, label: c.name }))"
        />
        <BaseSelect
          v-model="filters.location_id"
          label="Qyteti"
          placeholder="Të gjitha"
          :options="locations.map((l) => ({ value: l.id, label: l.city }))"
        />
        <BaseSelect
          v-model="filters.employment_type"
          label="Lloji i punësimit"
          placeholder="Të gjitha"
          :options="[
            { value: 'full_time', label: 'Full-time' },
            { value: 'part_time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' },
            { value: 'remote', label: 'Remote' },
          ]"
        />
        <div class="flex items-end">
          <BaseButton type="submit">Kërko</BaseButton>
        </div>
      </form>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-6">
      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!jobs.length" class="text-sm text-gray-600">Nuk u gjet asnjë pozitë.</p>

      <div v-else class="flex items-start gap-5">
        <!-- List pane -->
        <div
          class="w-full shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:w-80 lg:w-96"
          :class="selectedJob ? 'hidden sm:flex' : 'flex'"
        >
          <div class="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
            Gjetur <span class="font-semibold text-gray-900">{{ jobs.length }}</span> punë
          </div>
          <div class="max-h-[calc(100vh-11rem)] overflow-y-auto">
            <JobListItem
              v-for="job in jobs"
              :key="job.id"
              :job="job"
              :active="selectedJob?.id === job.id"
              :show-save="canSave"
              :saved="savedJobs.isSaved(job.id)"
              @select="selectJob"
              @toggle-save="savedJobs.toggle"
            />
          </div>
        </div>

        <!-- Detail pane -->
        <div class="min-w-0 flex-1" :class="selectedJob ? 'block' : 'hidden sm:block'">
          <button
            v-if="selectedJob"
            type="button"
            class="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 sm:hidden"
            @click="closeDetail"
          >
            ← Mbrapa te lista
          </button>

          <JobDetailPanel
            v-if="selectedJob"
            :key="selectedJob.id"
            :job="selectedJob"
            :show-save="canSave"
            :saved="savedJobs.isSaved(selectedJob.id)"
            @toggle-save="savedJobs.toggle"
          />
          <div v-else class="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
            Zgjedh një pozitë nga lista për të parë detajet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
