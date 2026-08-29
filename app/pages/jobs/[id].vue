<script setup lang="ts">
import type { Job } from '~/types/job'

const route = useRoute()
const jobId = Number(route.params.id)

const { loading, error, fetchJob } = useJobs()
const authStore = useAuthStore()
const savedJobs = useSavedJobs()

const job = ref<Job | null>(null)

const canSave = computed(() => authStore.user?.role === 'candidate')

onMounted(async () => {
  try {
    job.value = await fetchJob(jobId)
  } catch {
    // error state is already handled by useJobs
  }
  if (canSave.value) await savedJobs.fetchMine()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <div class="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-8">
      <NuxtLink to="/jobs" class="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        ← Back to jobs
      </NuxtLink>

      <p v-if="loading" class="text-sm text-gray-600">Loading job...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <JobDetailPanel
        v-else-if="job"
        :job="job"
        :show-save="canSave"
        :saved="savedJobs.isSaved(job.id)"
        @toggle-save="savedJobs.toggle"
      />
    </div>
  </div>
</template>
