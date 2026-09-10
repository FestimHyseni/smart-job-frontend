<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { applications, loading, error, fetchMine } = useMyApplications()

const search = ref('')
const filteredApplications = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return applications.value
  return applications.value.filter(
    (application) => application.job?.title.toLowerCase().includes(q) || application.job?.company?.name.toLowerCase().includes(q),
  )
})

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('sq-AL', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatInterviewDate(date: string) {
  return new Date(date).toLocaleString('sq-AL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

const typeLabels: Record<string, string> = {
  online: 'Online',
  physical: 'Fizike',
  phone: 'Telefonike',
}

onMounted(fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Aplikimet e mia</h1>

      <div v-if="applications.length" class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas titullit ose kompanisë..."
          class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600 dark:text-gray-400">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <p v-else-if="!applications.length" class="text-sm text-gray-500 dark:text-gray-400">
        Ende s'ke aplikuar për asnjë job. <NuxtLink to="/jobs" class="text-brand-600 hover:underline">Shfleto job-et →</NuxtLink>
      </p>
      <p v-else-if="!filteredApplications.length" class="text-sm text-gray-500 dark:text-gray-400">Asnjë rezultat për "{{ search }}".</p>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="application in filteredApplications" :key="application.id" class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-start justify-between gap-4">
            <div>
              <NuxtLink :to="`/jobs/${application.job_id}`" class="font-medium text-gray-900 hover:text-brand-600 hover:underline dark:text-white">
                {{ application.job?.title }}
              </NuxtLink>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ application.job?.company?.name }}</p>
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-400">Aplikuar më {{ formatDate(application.applied_at) }}</p>
            </div>
            <ApplicationStatusBadge :status="application.status" />
          </div>

          <p v-if="application.cover_letter" class="mt-3 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">{{ application.cover_letter }}</p>

          <div v-if="application.experience_summary || application.languages" class="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">
            <p v-if="application.experience_summary" class="text-gray-700 dark:text-gray-200">
              <span class="font-medium text-gray-900 dark:text-white">💼 Përvoja:</span> {{ application.experience_summary }}
            </p>
            <p v-if="application.languages" class="text-gray-700 dark:text-gray-200">
              <span class="font-medium text-gray-900 dark:text-white">🌐 Gjuhët:</span> {{ application.languages }}
            </p>
          </div>

          <div v-if="application.interviews?.length" class="mt-3 flex flex-col gap-2">
            <div
              v-for="interview in application.interviews"
              :key="interview.id"
              class="rounded-md bg-purple-50 p-3 text-sm text-purple-800"
            >
              <p class="font-medium">📅 Intervistë e caktuar — {{ formatInterviewDate(interview.scheduled_at) }}</p>
              <p class="text-purple-600 dark:text-purple-400">{{ typeLabels[interview.type] }}</p>
              <p v-if="interview.location" class="text-purple-600 dark:text-purple-400">📍 {{ interview.location }}</p>
              <a v-if="interview.meeting_url" :href="interview.meeting_url" target="_blank" class="text-purple-600 underline dark:text-purple-400">
                🔗 {{ interview.meeting_url }}
              </a>
              <p v-if="interview.notes" class="mt-1 text-purple-600 dark:text-purple-400">{{ interview.notes }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
