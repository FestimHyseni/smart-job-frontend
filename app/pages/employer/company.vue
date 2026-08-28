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
  <div class="min-h-screen bg-gray-50 pb-16">
    <div class="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-8">
      <!-- Header card -->
      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="h-16 bg-gradient-to-r from-brand-600 to-brand-400" />
        <div class="flex items-center gap-4 px-6 pb-5">
          <div class="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-brand-50 text-2xl shadow">
            🏢
          </div>
          <div class="pt-1">
            <h1 class="text-xl font-semibold text-gray-900">Kompania ime</h1>
            <p class="text-sm text-gray-500">Këto të dhëna shfaqen publikisht tek shpalljet e job-eve tuaja.</p>
          </div>
        </div>
      </div>

      <!-- Form card -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <form @submit.prevent="onSubmit">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">📋 Të dhënat e kompanisë</h2>
            <div class="flex items-center gap-3">
              <span v-if="saved" class="text-sm font-medium text-green-600">✓ U ruajt</span>
              <BaseButton type="submit" :loading="loading" :full-width="false" class="px-5">Ruaj kompaninë</BaseButton>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <BaseInput v-model="form.name" label="Company name" placeholder="Acme Inc." :error="fieldErrors.name?.[0]" />
            <BaseTextarea v-model="form.description" label="Description" placeholder="What does your company do?" :error="fieldErrors.description?.[0]" />

            <BaseSelect
              v-model="form.location_id"
              label="Location"
              :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
              :error="fieldErrors.location_id?.[0]"
            />

            <div class="grid grid-cols-2 gap-3">
              <BaseInput v-model="form.industry" label="Industry" placeholder="Software Development" :error="fieldErrors.industry?.[0]" />
              <BaseInput
                v-model="form.employees_count"
                label="Employees count (optional)"
                type="number"
                :error="fieldErrors.employees_count?.[0]"
              />
            </div>
            <BaseInput v-model="form.website" label="Website (optional)" placeholder="https://..." :error="fieldErrors.website?.[0]" />

            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </div>

      <div v-if="existingCompany" class="rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-center text-sm text-gray-600">
        Gati për të postuar një job?
        <NuxtLink to="/employer/jobs/create" class="font-medium text-brand-600 hover:underline">Posto job të ri →</NuxtLink>
      </div>
    </div>
  </div>
</template>
