<script setup lang="ts">
import type { JobCategory, JobPayload, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const jobId = Number(route.params.id)

const { loading, error, fieldErrors, fetchJob, updateJob } = useJobs()
const catalogService = useCatalogService()

const categories = ref<JobCategory[]>([])
const locations = ref<Location[]>([])
const notFound = ref(false)
const saved = ref(false)

const form = reactive<Omit<JobPayload, 'company_id'>>({
  category_id: 0,
  title: '',
  description: '',
  requirements: '',
  location_id: 0,
  employment_type: 'full_time',
  experience_level: 'junior',
  salary_min: null,
  salary_max: null,
  salary_currency: 'EUR',
  deadline: '',
})

onMounted(async () => {
  const [categoriesResult, locationsResult] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listLocations(),
  ])
  categories.value = categoriesResult
  locations.value = locationsResult

  try {
    const job = await fetchJob(jobId)
    form.title = job.title
    form.description = job.description
    form.requirements = job.requirements ?? ''
    form.category_id = job.category_id
    form.location_id = job.location_id
    form.employment_type = job.employment_type
    form.experience_level = job.experience_level
    form.salary_min = job.salary_min
    form.salary_max = job.salary_max
    form.salary_currency = job.salary_currency ?? 'EUR'
    form.deadline = job.deadline ? job.deadline.slice(0, 10) : ''
  } catch {
    notFound.value = true
  }
})

async function onSubmit() {
  saved.value = false
  try {
    await updateJob(jobId, {
      ...form,
      category_id: Number(form.category_id),
      location_id: Number(form.location_id),
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
    })
    saved.value = true
  } catch {
    // error state is already handled by useJobs
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Edito job-in</h1>

      <p v-if="notFound" class="text-sm text-red-600">Job-i nuk u gjet.</p>

      <form v-else class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.title" label="Titulli i job-it" placeholder="Senior Backend Developer" :error="fieldErrors.title?.[0]" />
        <BaseTextarea v-model="form.description" label="Përshkrimi" placeholder="Përshkruaj pozitën" :error="fieldErrors.description?.[0]" />
        <BaseTextarea v-model="form.requirements" label="Kërkesat" placeholder="Çfarë kërkon nga kandidati?" :error="fieldErrors.requirements?.[0]" />

        <BaseSelect
          v-model="form.category_id"
          label="Industria"
          :options="categories.map((c) => ({ value: c.id, label: c.name }))"
          :error="fieldErrors.category_id?.[0]"
        />
        <BaseSelect
          v-model="form.location_id"
          label="Qyteti"
          :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
          :error="fieldErrors.location_id?.[0]"
        />
        <BaseSelect
          v-model="form.employment_type"
          label="Lloji i punësimit"
          :options="[
            { value: 'full_time', label: 'Full-time' },
            { value: 'part_time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' },
            { value: 'remote', label: 'Remote' },
          ]"
          :error="fieldErrors.employment_type?.[0]"
        />
        <BaseSelect
          v-model="form.experience_level"
          label="Niveli i përvojës"
          :options="[
            { value: 'junior', label: 'Junior' },
            { value: 'mid', label: 'Mid' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
          ]"
          :error="fieldErrors.experience_level?.[0]"
        />

        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="form.salary_min" label="Paga minimale (opsionale)" type="number" :error="fieldErrors.salary_min?.[0]" />
          <BaseInput v-model="form.salary_max" label="Paga maksimale (opsionale)" type="number" :error="fieldErrors.salary_max?.[0]" />
        </div>
        <BaseInput v-model="form.salary_currency" label="Monedha" placeholder="EUR" :error="fieldErrors.salary_currency?.[0]" />
        <BaseInput v-model="form.deadline" label="Afati i aplikimit" type="date" :error="fieldErrors.deadline?.[0]" />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="saved" class="text-sm font-medium text-green-600">Job-i u përditësua me sukses.</p>

        <BaseButton type="submit" :loading="loading">Ruaj ndryshimet</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        <NuxtLink to="/employer/jobs" class="font-medium text-brand-600 hover:underline">← Mbrapa te job-et e mia</NuxtLink>
      </p>
    </div>
  </div>
</template>
