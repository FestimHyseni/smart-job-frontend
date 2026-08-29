<script setup lang="ts">
import type { JobViewStats } from '~/types/job'

definePageMeta({ middleware: 'auth' })

const { jobs, loading, error, fetchMyJobs, togglePublish, deleteJob, fetchViewStats } = useEmployerJobs()

const statsFor = ref<number | null>(null)
const statsCache = reactive<Record<number, JobViewStats>>({})
const statsLoading = ref<number | null>(null)

async function toggleStats(jobId: number) {
  if (statsFor.value === jobId) {
    statsFor.value = null
    return
  }
  statsFor.value = jobId
  if (statsCache[jobId]) return
  statsLoading.value = jobId
  try {
    statsCache[jobId] = await fetchViewStats(jobId)
  } finally {
    statsLoading.value = null
  }
}

function maxCount(stats: JobViewStats) {
  return Math.max(1, ...stats.daily.map((d) => d.count))
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

const search = ref('')
const filteredJobs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return jobs.value
  return jobs.value.filter((job) => job.title.toLowerCase().includes(q))
})

async function onDelete(jobId: number) {
  if (!confirm('A je i sigurt që do ta fshish këtë job? Ky veprim s\'mund të kthehet.')) return
  await deleteJob(jobId)
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  published: 'Publikuar',
  closed: 'Mbyllur',
  expired: 'Skaduar',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-50 text-green-700',
  closed: 'bg-red-50 text-red-700',
  expired: 'bg-red-50 text-red-700',
}

onMounted(fetchMyJobs)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Job-et e mia</h1>
        <NuxtLink to="/employer/jobs/create" class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Posto job të ri
        </NuxtLink>
      </div>

      <div v-if="jobs.length" class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas titullit..."
          class="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!jobs.length" class="text-sm text-gray-500">
        Ende s'ke postuar asnjë job. Sigurohu që ke krijuar
        <NuxtLink to="/employer/company" class="text-brand-600 hover:underline">kompaninë</NuxtLink> tënde më parë.
      </p>
      <p v-else-if="!filteredJobs.length" class="text-sm text-gray-500">Asnjë rezultat për "{{ search }}".</p>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="job in filteredJobs" :key="job.id" class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium text-gray-900">{{ job.title }}</p>
              <p class="text-sm text-gray-500">{{ job.location?.city }}, {{ job.location?.country }}</p>
            </div>
            <span class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium" :class="statusColors[job.status]">
              {{ statusLabels[job.status] }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-4 text-sm">
            <NuxtLink :to="`/employer/jobs/${job.id}/applicants`" class="font-medium text-brand-600 hover:underline">
              Shiko aplikantët →
            </NuxtLink>
            <NuxtLink :to="`/employer/jobs/${job.id}/edit`" class="font-medium text-gray-600 hover:underline">
              Edito
            </NuxtLink>
            <button
              v-if="job.status === 'draft' || job.status === 'closed'"
              type="button"
              class="font-medium text-green-600 hover:underline"
              @click="togglePublish(job)"
            >
              Publiko
            </button>
            <button
              v-else-if="job.status === 'published'"
              type="button"
              class="font-medium text-red-600 hover:underline"
              @click="togglePublish(job)"
            >
              Mbyll shpalljen
            </button>
            <button
              type="button"
              class="font-medium text-gray-600 hover:underline"
              @click="toggleStats(job.id)"
            >
              📊 Statistikat
            </button>
            <button
              type="button"
              class="ml-auto font-medium text-gray-400 hover:text-red-600"
              @click="onDelete(job.id)"
            >
              🗑 Fshi
            </button>
          </div>

          <div v-if="statsFor === job.id" class="mt-4 rounded-lg bg-gray-50 p-4">
            <p v-if="statsLoading === job.id" class="text-sm text-gray-500">Duke ngarkuar statistikat...</p>
            <template v-else-if="statsCache[job.id]">
              <p class="mb-3 text-sm text-gray-700">
                👁️ <span class="font-semibold text-gray-900">{{ statsCache[job.id]!.total }}</span> shikime gjithsej
              </p>
              <div class="flex items-end gap-1" style="height: 60px">
                <div
                  v-for="day in statsCache[job.id]!.daily"
                  :key="day.date"
                  class="flex-1 rounded-t bg-brand-400 transition hover:bg-brand-600"
                  :style="{ height: `${(day.count / maxCount(statsCache[job.id]!)) * 100}%` }"
                  :title="`${formatDay(day.date)}: ${day.count} shikime`"
                />
              </div>
              <div class="mt-1 flex justify-between text-[10px] text-gray-400">
                <span>{{ formatDay(statsCache[job.id]!.daily[0]!.date) }}</span>
                <span>{{ formatDay(statsCache[job.id]!.daily[statsCache[job.id]!.daily.length - 1]!.date) }}</span>
              </div>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
