<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const savedJobs = useSavedJobs()

onMounted(savedJobs.fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Job-et e ruajtura</h1>

      <p v-if="savedJobs.loading.value" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="savedJobs.error.value" class="text-sm text-red-600">{{ savedJobs.error.value }}</p>
      <p v-else-if="!savedJobs.items.value.length" class="text-sm text-gray-500">
        Ende s'ke ruajtur asnjë job. <NuxtLink to="/jobs" class="text-blue-600 hover:underline">Shfleto job-et →</NuxtLink>
      </p>

      <div v-else class="flex flex-col gap-4">
        <JobCard
          v-for="savedJob in savedJobs.items.value"
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
