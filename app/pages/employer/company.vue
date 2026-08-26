<script setup lang="ts">
import type { Company, Location } from '~/types/job'
import type { CompanyPayload } from '~/types/employer'
import { useCatalogService } from '~/services/catalog'

definePageMeta({ middleware: 'auth' })

const { loading, error, fieldErrors, fetchMyCompany, saveCompany } = useEmployerCompany()
const catalogService = useCatalogService()

const locations = ref<Location[]>([])
const existingCompany = ref<Company | null>(null)
const saved = ref(false)

const form = reactive<CompanyPayload>({
  name: '',
  description: '',
  website: '',
  location_id: 0,
  industry: '',
  employees_count: null,
})

onMounted(async () => {
  locations.value = await catalogService.listLocations()
  const company = await fetchMyCompany()
  existingCompany.value = company
  if (company) {
    form.name = company.name
    form.description = company.description
    form.website = company.website ?? ''
    form.location_id = company.location_id
    form.industry = company.industry
    form.employees_count = company.employees_count
  } else if (locations.value.length) {
    form.location_id = locations.value[0].id
  }
})

async function onSubmit() {
  saved.value = false
  try {
    existingCompany.value = await saveCompany(existingCompany.value, {
      ...form,
      location_id: Number(form.location_id),
      employees_count: form.employees_count ? Number(form.employees_count) : null,
    })
    saved.value = true
  } catch {
    // error state is already handled by useEmployerCompany
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-lg rounded-lg bg-white p-8 shadow">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">My company</h1>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.name" label="Company name" placeholder="Acme Inc." :error="fieldErrors.name?.[0]" />
        <BaseTextarea v-model="form.description" label="Description" placeholder="What does your company do?" :error="fieldErrors.description?.[0]" />

        <BaseSelect
          v-model="form.location_id"
          label="Location"
          :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
          :error="fieldErrors.location_id?.[0]"
        />

        <BaseInput v-model="form.industry" label="Industry" placeholder="Software Development" :error="fieldErrors.industry?.[0]" />
        <BaseInput v-model="form.website" label="Website (optional)" placeholder="https://..." :error="fieldErrors.website?.[0]" />
        <BaseInput
          v-model="form.employees_count"
          label="Employees count (optional)"
          type="number"
          :error="fieldErrors.employees_count?.[0]"
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="saved" class="text-sm text-green-600">Company saved.</p>

        <BaseButton type="submit" :loading="loading">Save company</BaseButton>
      </form>

      <p v-if="existingCompany" class="mt-6 text-center text-sm text-gray-600">
        <NuxtLink to="/employer/jobs/create" class="font-medium text-blue-600 hover:underline">Post a job →</NuxtLink>
      </p>
    </div>
  </div>
</template>
