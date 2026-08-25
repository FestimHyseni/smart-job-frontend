<script setup lang="ts">
import type { CandidateProfile, CandidateProfilePayload } from '~/types/candidateProfile'
import type { Location } from '~/types/job'
import { useCatalogService } from '~/services/catalog'

definePageMeta({ middleware: 'auth' })

const { loading, error, fieldErrors, fetchMyProfile, saveProfile } = useCandidateProfile()
const catalogService = useCatalogService()

const locations = ref<Location[]>([])
const existingProfile = ref<CandidateProfile | null>(null)
const saved = ref(false)

const form = reactive<CandidateProfilePayload>({
  headline: '',
  bio: '',
  location_id: 0,
  years_experience: 0,
  expected_salary: 0,
  salary_currency: 'EUR',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
})

onMounted(async () => {
  locations.value = await catalogService.listLocations()
  const profile = await fetchMyProfile()
  existingProfile.value = profile
  if (profile) {
    form.headline = profile.headline
    form.bio = profile.bio
    form.location_id = profile.location_id
    form.years_experience = profile.years_experience
    form.expected_salary = profile.expected_salary
    form.salary_currency = profile.salary_currency
    form.linkedin_url = profile.linkedin_url ?? ''
    form.github_url = profile.github_url ?? ''
    form.portfolio_url = profile.portfolio_url ?? ''
  } else if (locations.value.length) {
    form.location_id = locations.value[0].id
  }
})

async function onSubmit() {
  saved.value = false
  try {
    existingProfile.value = await saveProfile(existingProfile.value, {
      ...form,
      years_experience: Number(form.years_experience),
      expected_salary: Number(form.expected_salary),
      location_id: Number(form.location_id),
    })
    saved.value = true
  } catch {
    // error state is already handled by useCandidateProfile
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-lg rounded-lg bg-white p-8 shadow">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">My profile</h1>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.headline" label="Headline" placeholder="Senior Backend Developer" :error="fieldErrors.headline?.[0]" />
        <BaseTextarea v-model="form.bio" label="Bio" placeholder="Tell employers about yourself" :error="fieldErrors.bio?.[0]" />

        <BaseSelect
          v-model="form.location_id"
          label="Location"
          :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
          :error="fieldErrors.location_id?.[0]"
        />

        <BaseInput
          v-model="form.years_experience"
          label="Years of experience"
          type="number"
          :error="fieldErrors.years_experience?.[0]"
        />

        <div class="grid grid-cols-2 gap-3">
          <BaseInput
            v-model="form.expected_salary"
            label="Expected salary"
            type="number"
            :error="fieldErrors.expected_salary?.[0]"
          />
          <BaseInput
            v-model="form.salary_currency"
            label="Currency"
            placeholder="EUR"
            :error="fieldErrors.salary_currency?.[0]"
          />
        </div>

        <BaseInput v-model="form.linkedin_url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/..." :error="fieldErrors.linkedin_url?.[0]" />
        <BaseInput v-model="form.github_url" label="GitHub URL (optional)" placeholder="https://github.com/..." :error="fieldErrors.github_url?.[0]" />
        <BaseInput v-model="form.portfolio_url" label="Portfolio URL (optional)" placeholder="https://..." :error="fieldErrors.portfolio_url?.[0]" />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="saved" class="text-sm text-green-600">Profile saved.</p>

        <BaseButton type="submit" :loading="loading">Save profile</BaseButton>
      </form>
    </div>
  </div>
</template>
