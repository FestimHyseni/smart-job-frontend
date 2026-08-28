<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const savedJobs = useSavedJobs()

const search = ref('')
const filteredSavedJobs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return savedJobs.items.value
  return savedJobs.items.value.filter(
    (item) => item.job?.title.toLowerCase().includes(q) || item.job?.company?.name.toLowerCase().includes(q),
  )
})

onMounted(savedJobs.fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Job-et e ruajtura</h1>

      <div v-if="savedJobs.items.value.length" class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas titullit ose kompanisë..."
          class="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
        >
      </div>

      <p v-if="savedJobs.loading.value" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="savedJobs.error.value" class="text-sm text-red-600">{{ savedJobs.error.value }}</p>
      <p v-else-if="!savedJobs.items.value.length" class="text-sm text-gray-500">
        Ende s'ke ruajtur asnjë job. <NuxtLink to="/jobs" class="text-brand-600 hover:underline">Shfleto job-et →</NuxtLink>
      </p>
      <p v-else-if="!filteredSavedJobs.length" class="text-sm text-gray-500">Asnjë rezultat për "{{ search }}".</p>

      <div v-else class="flex flex-col gap-4">
        <JobCard
          v-for="savedJob in filteredSavedJobs"
          :key="savedJob.id"
          :job="savedJob.job!"
          :show-save="true"
          :saved="true"
          @toggle-save="savedJobs.toggle"
        />
      </div>
    </div>
  </div>
</template>
