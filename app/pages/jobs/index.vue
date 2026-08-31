<script setup lang="ts">
import type { Job, JobCategory, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'
import { useJobsService } from '~/services/jobs'

const { jobs, loading, error, fetchJobs } = useJobs()
const jobsService = useJobsService()
const catalogService = useCatalogService()
const authStore = useAuthStore()
const savedJobs = useSavedJobs()
const cvRec = useCvRecommendations()

const canSave = computed(() => authStore.user?.role === 'candidate')

const categories = ref<JobCategory[]>([])
const locations = ref<Location[]>([])
const selectedJob = ref<Job | null>(null)

const showCvCard = ref(false)
const cvFile = ref<File | null>(null)

const displayedJobs = computed(() => cvRec.result.value?.jobs ?? jobs.value)

function onCvFileChange(event: Event) {
  cvFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function onAnalyzeCv() {
  if (!cvFile.value) return
  await cvRec.analyze(cvFile.value)
  if (cvRec.result.value) {
    selectedJob.value = cvRec.result.value.jobs[0] ?? null
  }
}

function onClearRecommendation() {
  cvRec.reset()
  cvFile.value = null
  showCvCard.value = false
  selectedJob.value = jobs.value[0] ?? null
}

function scoreFor(jobId: number) {
  return cvRec.result.value?.jobs.find((j) => j.id === jobId)?.match_score
}

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
        <BaseInput v-model="filters.search" label="Kërko sipas pozitës së punës" placeholder="Titulli i punës" />
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

    <div class="mx-auto max-w-6xl px-4 pt-4">
      <div class="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <button
          type="button"
          class="flex w-full items-center justify-between text-left"
          @click="showCvCard = !showCvCard"
        >
          <span class="flex items-center gap-2 text-sm font-semibold text-gray-900">
            🎯 Zbulo punët e përshtatshme për ty — ngarko CV-në
          </span>
          <span class="text-gray-400">{{ showCvCard ? '▲' : '▼' }}</span>
        </button>

        <div v-if="showCvCard" class="mt-3 flex flex-col gap-3">
          <template v-if="!cvRec.result.value">
            <p class="text-sm text-gray-600">Ngarko CV-në (PDF ose DOCX) dhe do të shohësh pozitat që përputhen më shumë me aftësitë e tua.</p>
            <div class="flex flex-wrap items-center gap-3">
              <input type="file" accept=".pdf,.docx" class="text-sm" @change="onCvFileChange">
              <BaseButton type="button" :full-width="false" :loading="cvRec.loading.value" :disabled="!cvFile" class="px-5" @click="onAnalyzeCv">
                Analizo CV-në
              </BaseButton>
            </div>
            <p v-if="cvRec.error.value" class="text-sm text-red-600">{{ cvRec.error.value }}</p>
          </template>

          <template v-else>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p v-if="cvRec.result.value.matched_skills.length" class="text-sm text-gray-700">
                <span class="font-medium">Aftësitë e gjetura:</span> {{ cvRec.result.value.matched_skills.join(', ') }}
              </p>
              <p v-else class="text-sm text-gray-500">S'u identifikuan aftësi të njohura në CV-në tënde.</p>
              <button type="button" class="text-sm font-medium text-brand-600 hover:underline" @click="onClearRecommendation">
                ✕ Pastro rekomandimin
              </button>
            </div>
            <p v-if="!cvRec.result.value.jobs.length" class="text-sm text-gray-500">
              S'u gjetën pozita që përputhen me aftësitë e identifikuara.
            </p>
            <p v-else class="text-sm font-medium text-green-700">
              🎯 {{ cvRec.result.value.jobs.length }} pozita të rekomanduara për ty, sipas përputhjes.
            </p>
          </template>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-6">
      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!displayedJobs.length" class="text-sm text-gray-600">Nuk u gjet asnjë pozitë.</p>

      <div v-else class="flex items-start gap-5">
        <!-- List pane -->
        <div
          class="w-full shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:w-80 lg:w-96"
          :class="selectedJob ? 'hidden sm:flex' : 'flex'"
        >
          <div class="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
            Gjetur <span class="font-semibold text-gray-900">{{ displayedJobs.length }}</span> punë
          </div>
          <div class="max-h-[calc(100vh-11rem)] overflow-y-auto">
            <JobListItem
              v-for="job in displayedJobs"
              :key="job.id"
              :job="job"
              :active="selectedJob?.id === job.id"
              :show-save="canSave"
              :saved="savedJobs.isSaved(job.id)"
              :match-score="scoreFor(job.id)"
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
