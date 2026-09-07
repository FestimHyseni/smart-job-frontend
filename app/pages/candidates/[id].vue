<script setup lang="ts">
import type { CandidateDetail } from '~/types/candidate'
import { ApiRequestError } from '~/types/auth'
import { useCandidatesService } from '~/services/candidates'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const candidateId = Number(route.params.id)

const candidatesService = useCandidatesService()
const { resolveUrl } = useBackendOrigin()

const candidate = ref<CandidateDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    candidate.value = await candidatesService.show(candidateId)
  } catch (err) {
    error.value = err instanceof ApiRequestError ? err.message : 'Diçka shkoi keq. Provo përsëri.'
  } finally {
    loading.value = false
  }
})

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('sq-AL', { year: 'numeric', month: 'short' })
}

const proficiencyLabels: Record<string, string> = {
  a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2',
}

const skillLevelLabels: Record<string, string> = {
  beginner: 'Fillestar',
  intermediate: 'Mesatar',
  advanced: 'I avancuar',
  expert: 'Ekspert',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
    <div class="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-8">
      <NuxtLink to="/employer/jobs" class="text-sm font-medium text-brand-600 hover:underline">
        ← Të gjitha job-et
      </NuxtLink>

      <p v-if="loading" class="text-sm text-gray-600 dark:text-gray-400">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <template v-else-if="candidate">
        <!-- Header card -->
        <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="h-16 bg-gradient-to-r from-brand-600 to-brand-400" />
          <div class="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <div class="-mt-10 shrink-0">
              <img
                v-if="candidate.avatar_url"
                :src="resolveUrl(candidate.avatar_url) ?? undefined"
                alt="Avatar"
                class="h-20 w-20 rounded-full border-4 border-white object-cover shadow"
              >
              <div v-else class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-2xl font-semibold text-gray-500 shadow dark:text-gray-400 dark:bg-gray-800">
                {{ candidate.name[0] }}
              </div>
            </div>
            <div class="flex-1 pt-2">
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ candidate.name }}</h1>
              <p v-if="candidate.profile?.headline" class="text-sm text-gray-600 dark:text-gray-400">{{ candidate.profile.headline }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ candidate.email }}</p>
              <p v-if="candidate.phone" class="text-sm text-gray-500 dark:text-gray-400">{{ candidate.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Profile summary -->
        <div v-if="candidate.profile" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">👤 Përmbledhje</h2>
          <p v-if="candidate.profile.bio" class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{{ candidate.profile.bio }}</p>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <span v-if="candidate.profile.location">📍 {{ candidate.profile.location.city }}, {{ candidate.profile.location.country }}</span>
            <span v-if="candidate.profile.years_experience">🧑‍💻 {{ candidate.profile.years_experience }} vjet përvojë</span>
            <span v-if="candidate.profile.expected_salary">💰 {{ candidate.profile.expected_salary }} {{ candidate.profile.salary_currency }}</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-4 text-sm">
            <a v-if="candidate.profile.linkedin_url" :href="candidate.profile.linkedin_url" target="_blank" class="text-brand-600 hover:underline">LinkedIn</a>
            <a v-if="candidate.profile.github_url" :href="candidate.profile.github_url" target="_blank" class="text-brand-600 hover:underline">GitHub</a>
            <a v-if="candidate.profile.portfolio_url" :href="candidate.profile.portfolio_url" target="_blank" class="text-brand-600 hover:underline">Portfolio</a>
          </div>
        </div>

        <!-- Resumes -->
        <div v-if="candidate.resumes.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">📄 Dokumentet</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="resume in candidate.resumes" :key="resume.id">
              <a :href="resolveUrl(resume.file_url) ?? '#'" target="_blank" class="text-sm text-brand-600 hover:underline">
                📎 {{ resume.file_name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Skills -->
        <div v-if="candidate.skills.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">🛠️ Aftësitë</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="cs in candidate.skills"
              :key="cs.id"
              class="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
            >
              {{ cs.skill?.name }} <span class="text-brand-400">· {{ skillLevelLabels[cs.level] ?? cs.level }}</span>
            </span>
          </div>
        </div>

        <!-- Experience -->
        <div v-if="candidate.experiences.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">💼 Përvoja e punës</h2>
          <ul class="flex flex-col gap-3">
            <li v-for="exp in candidate.experiences" :key="exp.id" class="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
              <p class="font-medium text-gray-900 dark:text-white">{{ exp.position }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ exp.company_name }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(exp.start_date) }} — {{ exp.is_current ? 'Aktualisht' : formatDate(exp.end_date) }}</p>
              <p v-if="exp.description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ exp.description }}</p>
            </li>
          </ul>
        </div>

        <!-- Education -->
        <div v-if="candidate.educations.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">🎓 Edukimi</h2>
          <ul class="flex flex-col gap-3">
            <li v-for="edu in candidate.educations" :key="edu.id" class="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
              <p class="font-medium text-gray-900 dark:text-white">{{ edu.degree }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ edu.institution }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(edu.start_date) }} — {{ formatDate(edu.end_date) || 'Prezent' }}</p>
            </li>
          </ul>
        </div>

        <!-- Languages -->
        <div v-if="candidate.languages.length" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">🌐 Gjuhët e huaja</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="lang in candidate.languages" :key="lang.id" class="text-sm text-gray-700 dark:text-gray-200">
              <span class="font-medium text-gray-900 dark:text-white">{{ lang.name }}</span>
              — Të folurit: {{ proficiencyLabels[lang.speaking] }} · Të shkruarit: {{ proficiencyLabels[lang.writing] }} ·
              Të dëgjuarit: {{ proficiencyLabels[lang.listening] }} · Të kuptuarit: {{ proficiencyLabels[lang.understanding] }}
            </li>
          </ul>
        </div>

        <p
          v-if="!candidate.profile && !candidate.skills.length && !candidate.experiences.length && !candidate.educations.length"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Ky kandidat ende s'e ka plotësuar profilin e tij.
        </p>
      </template>
    </div>
  </div>
</template>
