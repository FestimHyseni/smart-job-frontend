<script setup lang="ts">
import type { Company, JobCategory, JobPayload, Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

definePageMeta({ middleware: 'auth' })

const { loading, error, fieldErrors, createJob } = useJobs()
const { fetchMyCompany } = useEmployerCompany()
const catalogService = useCatalogService()

const company = ref<Company | null>(null)
const categories = ref<JobCategory[]>([])
const locations = ref<Location[]>([])
const created = ref(false)

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
  const [categoriesResult, locationsResult, myCompany] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listLocations(),
    fetchMyCompany(),
  ])
  categories.value = categoriesResult
  locations.value = locationsResult
  company.value = myCompany
  if (categories.value.length) form.category_id = categories.value[0].id
  if (locations.value.length) form.location_id = locations.value[0].id
})

async function onSubmit() {
  if (!company.value) return
  try {
    await createJob({
      ...form,
      company_id: company.value.id,
      category_id: Number(form.category_id),
      location_id: Number(form.location_id),
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
    })
    created.value = true
  } catch {
    // error state is already handled by useJobs
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Posto job</h1>

      <p v-if="!company" class="text-sm text-gray-600">
        Duhet të
        <NuxtLink to="/employer/company" class="font-medium text-brand-600 hover:underline">krijosh kompaninë</NuxtLink>
        para se të postosh një job.
      </p>

      <p v-else-if="created" class="text-sm font-medium text-green-600">
        Job-i u postua me sukses!
        <NuxtLink to="/employer/jobs" class="font-medium text-brand-600 hover:underline">Shiko job-et e mia</NuxtLink>
      </p>

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

        <BaseButton type="submit" :loading="loading">Posto job-in</BaseButton>
      </form>
    </div>
  </div>
</template>
