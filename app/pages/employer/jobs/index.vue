<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { jobs, loading, error, fetchMyJobs, togglePublish, deleteJob } = useEmployerJobs()

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
        <li v-for="job in filteredJobs" :key="job.id" class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
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
              class="ml-auto font-medium text-gray-400 hover:text-red-600"
              @click="onDelete(job.id)"
            >
              🗑 Fshi
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
