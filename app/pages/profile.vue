<script setup lang="ts">
import type { CandidateProfile, CandidateProfilePayload } from '~/types/candidateProfile'
import type { Location } from '~/types/job'
import type { LanguageProficiency, Skill } from '~/types/profileExtras'
import { useCatalogService } from '~/services/catalog'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { loading, error, fieldErrors, fetchMyProfile, saveProfile } = useCandidateProfile()
const { updateAvatar } = useAuth()
const catalogService = useCatalogService()
const { resolveUrl } = useBackendOrigin()

const experiences = useExperiences()
const educations = useEducations()
const candidateSkills = useCandidateSkills()
const candidateLanguages = useCandidateLanguages()
const resumes = useResumes()

const locations = ref<Location[]>([])
const skillsCatalog = ref<Skill[]>([])
const existingProfile = ref<CandidateProfile | null>(null)
const saved = ref(false)
const avatarUploading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

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

const profileCompletion = computed(() => {
  const checks = [
    Boolean(authStore.user?.avatar_url),
    Boolean(existingProfile.value),
    resumes.items.value.length > 0,
    experiences.items.value.length > 0,
    educations.items.value.length > 0,
    candidateSkills.items.value.length > 0,
    candidateLanguages.items.value.length > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

onMounted(async () => {
  locations.value = await catalogService.listLocations()
  skillsCatalog.value = await catalogService.listSkills()

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

  await Promise.all([
    resumes.fetchMine(),
    experiences.fetchMine(),
    educations.fetchMine(),
    candidateSkills.fetchMine(),
    candidateLanguages.fetchMine(),
  ])
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

async function onAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarUploading.value = true
  try {
    await updateAvatar(file)
  } catch {
    // error state is already handled by useAuth
  } finally {
    avatarUploading.value = false
  }
}

// Resumes
async function onResumeUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    await resumes.upload(file)
  } catch {
    // error state is already handled by useResumes
  } finally {
    ;(event.target as HTMLInputElement).value = ''
  }
}

// Experience
const showExperienceForm = ref(false)
const experienceForm = reactive({
  company_name: '',
  position: '',
  description: '',
  start_date: '',
  end_date: '',
  is_current: false,
})
async function onAddExperience() {
  await experiences.add({
    ...experienceForm,
    end_date: experienceForm.is_current ? null : experienceForm.end_date || null,
  })
  Object.assign(experienceForm, { company_name: '', position: '', description: '', start_date: '', end_date: '', is_current: false })
  showExperienceForm.value = false
}

// Education
const showEducationForm = ref(false)
const educationForm = reactive({
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: '',
  description: '',
})
async function onAddEducation() {
  await educations.add({ ...educationForm, end_date: educationForm.end_date || null })
  Object.assign(educationForm, { institution: '', degree: '', field: '', start_date: '', end_date: '', description: '' })
  showEducationForm.value = false
}

// Skills
const newSkillId = ref<number | ''>('')
const newSkillLevel = ref<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')
async function onAddSkill() {
  if (!newSkillId.value) return
  await candidateSkills.add(Number(newSkillId.value), newSkillLevel.value)
  newSkillId.value = ''
}

// Languages
const showLanguageForm = ref(false)
const languageForm = reactive<{ name: string; speaking: LanguageProficiency; writing: LanguageProficiency; listening: LanguageProficiency; understanding: LanguageProficiency }>({
  name: '',
  speaking: 'b1',
  writing: 'b1',
  listening: 'b1',
  understanding: 'b1',
})
async function onAddLanguage() {
  await candidateLanguages.add({ ...languageForm })
  Object.assign(languageForm, { name: '', speaking: 'b1', writing: 'b1', listening: 'b1', understanding: 'b1' })
  showLanguageForm.value = false
}

const proficiencyOptions = [
  { value: 'a1', label: 'A1' },
  { value: 'a2', label: 'A2' },
  { value: 'b1', label: 'B1' },
  { value: 'b2', label: 'B2' },
  { value: 'c1', label: 'C1' },
  { value: 'c2', label: 'C2' },
]
function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('sq-AL', { year: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <div class="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-8">
      <!-- Header card: cover + avatar + completion -->
      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="h-20 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div class="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div class="relative -mt-10 shrink-0">
            <img
              v-if="authStore.user?.avatar_url"
              :src="resolveUrl(authStore.user.avatar_url)"
              alt="Avatar"
              class="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
            >
            <div v-else class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-3xl font-semibold text-gray-500 shadow">
              {{ authStore.user?.name?.[0] }}
            </div>
            <button
              type="button"
              class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white shadow ring-2 ring-white hover:bg-blue-700 disabled:opacity-60"
              :disabled="avatarUploading"
              title="Ndrysho foton"
              @click="avatarInput?.click()"
            >
              📷
            </button>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange">
          </div>

          <div class="flex-1 pt-2">
            <h1 class="text-xl font-semibold text-gray-900">{{ authStore.user?.name }}</h1>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
            <p v-if="authStore.user?.phone" class="text-sm text-gray-500">{{ authStore.user.phone }}</p>
          </div>

          <div class="w-full pt-2 sm:w-48">
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="font-medium text-gray-500">Profili i plotësuar</span>
              <span class="font-semibold text-green-600">{{ profileCompletion }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-gray-100">
              <div class="h-full rounded-full bg-green-500 transition-all" :style="{ width: `${profileCompletion}%` }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main profile form -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <form @submit.prevent="onSubmit">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">👤 Të dhënat e profilit</h2>
            <div class="flex items-center gap-3">
              <span v-if="saved" class="text-sm font-medium text-green-600">✓ U ruajt</span>
              <BaseButton type="submit" :loading="loading" :full-width="false" class="px-5">Ruaj profilin</BaseButton>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <BaseInput v-model="form.headline" label="Headline" placeholder="Senior Backend Developer" :error="fieldErrors.headline?.[0]" />
            <BaseTextarea v-model="form.bio" label="Përmbledhje e shkurtër" placeholder="Tell employers about yourself" :error="fieldErrors.bio?.[0]" />

            <BaseSelect
              v-model="form.location_id"
              label="Location"
              :options="locations.map((l) => ({ value: l.id, label: `${l.city}, ${l.country}` }))"
              :error="fieldErrors.location_id?.[0]"
            />

            <BaseInput v-model="form.years_experience" label="Years of experience" type="number" :error="fieldErrors.years_experience?.[0]" />

            <div class="grid grid-cols-2 gap-3">
              <BaseInput v-model="form.expected_salary" label="Expected salary" type="number" :error="fieldErrors.expected_salary?.[0]" />
              <BaseInput v-model="form.salary_currency" label="Currency" placeholder="EUR" :error="fieldErrors.salary_currency?.[0]" />
            </div>

            <BaseInput v-model="form.linkedin_url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/..." :error="fieldErrors.linkedin_url?.[0]" />
            <BaseInput v-model="form.github_url" label="GitHub URL (optional)" placeholder="https://github.com/..." :error="fieldErrors.github_url?.[0]" />
            <BaseInput v-model="form.portfolio_url" label="Portfolio URL (optional)" placeholder="https://..." :error="fieldErrors.portfolio_url?.[0]" />

            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </div>

      <!-- Documents / CV -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">📄 Dokumentet e mia</h2>
          <label class="cursor-pointer rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600">
            + Shto
            <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="onResumeUpload">
          </label>
        </div>
        <p v-if="resumes.error.value" class="mb-3 text-sm text-red-600">{{ resumes.error.value }}</p>
        <p v-if="!resumes.items.value.length" class="text-sm text-gray-400">Ende s'ke ngarkuar asnjë dokument.</p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="resume in resumes.items.value"
            :key="resume.id"
            class="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            <a :href="resolveUrl(resume.file_url) ?? '#'" target="_blank" class="flex items-center gap-2 text-blue-600 hover:underline">
              📎 {{ resume.file_name }}
            </a>
            <button type="button" class="text-gray-400 hover:text-red-600" @click="resumes.remove(resume.id)">🗑</button>
          </li>
        </ul>
      </div>

      <!-- Experience -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">💼 Përvoja e punës</h2>
          <button type="button" class="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600" @click="showExperienceForm = !showExperienceForm">
            {{ showExperienceForm ? 'Mbyll' : '+ Shto' }}
          </button>
        </div>

        <form v-if="showExperienceForm" class="mb-5 flex flex-col gap-3 rounded-lg bg-gray-50 p-4" @submit.prevent="onAddExperience">
          <BaseInput v-model="experienceForm.position" label="Pozita" placeholder="Frontend Developer" />
          <BaseInput v-model="experienceForm.company_name" label="Kompania" placeholder="Acme Inc." />
          <BaseTextarea v-model="experienceForm.description" label="Përshkrimi (opsional)" />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="experienceForm.start_date" label="Fillimi" type="date" />
            <BaseInput v-model="experienceForm.end_date" label="Mbarimi" type="date" :disabled="experienceForm.is_current" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="experienceForm.is_current" type="checkbox">
            Aktualisht punoj këtu
          </label>
          <BaseButton type="submit" :full-width="false" class="self-start px-5">Ruaj</BaseButton>
        </form>

        <p v-if="!experiences.items.value.length && !showExperienceForm" class="text-sm text-gray-400">Ende s'ke shtuar përvojë pune.</p>
        <ul class="flex flex-col gap-3">
          <li v-for="exp in experiences.items.value" :key="exp.id" class="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div>
              <p class="font-medium text-gray-900">{{ exp.position }}</p>
              <p class="text-sm text-gray-600">{{ exp.company_name }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(exp.start_date) }} — {{ exp.is_current ? 'Aktualisht' : formatDate(exp.end_date) }}</p>
            </div>
            <button type="button" class="text-gray-400 hover:text-red-600" @click="experiences.remove(exp.id)">🗑</button>
          </li>
        </ul>
      </div>

      <!-- Education -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">🎓 Edukimi</h2>
          <button type="button" class="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600" @click="showEducationForm = !showEducationForm">
            {{ showEducationForm ? 'Mbyll' : '+ Shto' }}
          </button>
        </div>

        <form v-if="showEducationForm" class="mb-5 flex flex-col gap-3 rounded-lg bg-gray-50 p-4" @submit.prevent="onAddEducation">
          <BaseInput v-model="educationForm.degree" label="Diploma / Programi" placeholder="Computer Science" />
          <BaseInput v-model="educationForm.institution" label="Institucioni" placeholder="University for Business and Technology" />
          <BaseInput v-model="educationForm.field" label="Fusha" placeholder="Software Engineering" />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="educationForm.start_date" label="Fillimi" type="date" />
            <BaseInput v-model="educationForm.end_date" label="Mbarimi (opsional)" type="date" />
          </div>
          <BaseTextarea v-model="educationForm.description" label="Përshkrimi (opsional)" />
          <BaseButton type="submit" :full-width="false" class="self-start px-5">Ruaj</BaseButton>
        </form>

        <p v-if="!educations.items.value.length && !showEducationForm" class="text-sm text-gray-400">Ende s'ke shtuar edukim.</p>
        <ul class="flex flex-col gap-3">
          <li v-for="edu in educations.items.value" :key="edu.id" class="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div>
              <p class="font-medium text-gray-900">{{ edu.degree }}</p>
              <p class="text-sm text-gray-600">{{ edu.institution }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(edu.start_date) }} — {{ formatDate(edu.end_date) || 'Prezent' }}</p>
            </div>
            <button type="button" class="text-gray-400 hover:text-red-600" @click="educations.remove(edu.id)">🗑</button>
          </li>
        </ul>
      </div>

      <!-- Skills -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">🛠️ Aftësitë</h2>

        <p v-if="!candidateSkills.items.value.length" class="mb-4 text-sm text-gray-400">Ende s'ke shtuar aftësi.</p>
        <div v-else class="mb-5 flex flex-wrap gap-2">
          <span
            v-for="cs in candidateSkills.items.value"
            :key="cs.id"
            class="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
          >
            {{ cs.skill?.name }}
            <button type="button" class="text-blue-400 hover:text-red-600" @click="candidateSkills.remove(cs.id)">×</button>
          </span>
        </div>

        <div class="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-4">
          <BaseSelect v-model="newSkillId" label="Shto aftësi" placeholder="Zgjedh aftësinë" :options="skillsCatalog.map((s) => ({ value: s.id, label: s.name }))" />
          <BaseSelect v-model="newSkillLevel" label="Niveli" :options="[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
            { value: 'expert', label: 'Expert' },
          ]" />
          <BaseButton type="button" :full-width="false" class="px-5" @click="onAddSkill">+ Shto</BaseButton>
        </div>
      </div>

      <!-- Languages -->
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900">🌐 Gjuhët e huaja</h2>
          <button type="button" class="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600" @click="showLanguageForm = !showLanguageForm">
            {{ showLanguageForm ? 'Mbyll' : '+ Shto' }}
          </button>
        </div>

        <form v-if="showLanguageForm" class="mb-5 flex flex-col gap-3 rounded-lg bg-gray-50 p-4" @submit.prevent="onAddLanguage">
          <BaseInput v-model="languageForm.name" label="Gjuha" placeholder="Anglisht" />
          <div class="grid grid-cols-2 gap-3">
            <BaseSelect v-model="languageForm.speaking" label="Të folurit" :options="proficiencyOptions" />
            <BaseSelect v-model="languageForm.writing" label="Të shkruarit" :options="proficiencyOptions" />
            <BaseSelect v-model="languageForm.listening" label="Të dëgjuarit" :options="proficiencyOptions" />
            <BaseSelect v-model="languageForm.understanding" label="Të kuptuarit" :options="proficiencyOptions" />
          </div>
          <BaseButton type="submit" :full-width="false" class="self-start px-5">Ruaj</BaseButton>
        </form>

        <p v-if="!candidateLanguages.items.value.length && !showLanguageForm" class="text-sm text-gray-400">Ende s'ke shtuar gjuhë.</p>
        <ul class="flex flex-col gap-3">
          <li v-for="lang in candidateLanguages.items.value" :key="lang.id" class="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div>
              <p class="font-medium text-gray-900">{{ lang.name }}</p>
              <p class="text-xs text-gray-500">
                Të folurit: {{ lang.speaking.toUpperCase() }} · Të shkruarit: {{ lang.writing.toUpperCase() }} ·
                Të dëgjuarit: {{ lang.listening.toUpperCase() }} · Të kuptuarit: {{ lang.understanding.toUpperCase() }}
              </p>
            </div>
            <button type="button" class="text-gray-400 hover:text-red-600" @click="candidateLanguages.remove(lang.id)">🗑</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
