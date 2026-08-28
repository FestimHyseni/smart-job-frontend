<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { applications, loading, error, fetchMine } = useMyApplications()

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('sq-AL', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatInterviewDate(date: string) {
  return new Date(date).toLocaleString('sq-AL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const typeLabels: Record<string, string> = {
  online: 'Online',
  physical: 'Fizike',
  phone: 'Telefonike',
}

onMounted(fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Aplikimet e mia</h1>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!applications.length" class="text-sm text-gray-500">
        Ende s'ke aplikuar për asnjë job. <NuxtLink to="/jobs" class="text-blue-600 hover:underline">Shfleto job-et →</NuxtLink>
      </p>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="application in applications" :key="application.id" class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <NuxtLink :to="`/jobs/${application.job_id}`" class="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                {{ application.job?.title }}
              </NuxtLink>
              <p class="text-sm text-gray-500">{{ application.job?.company?.name }}</p>
              <p class="mt-1 text-xs text-gray-400">Aplikuar më {{ formatDate(application.applied_at) }}</p>
            </div>
            <ApplicationStatusBadge :status="application.status" />
          </div>

          <p v-if="application.cover_letter" class="mt-3 whitespace-pre-line text-sm text-gray-600">{{ application.cover_letter }}</p>

          <div v-if="application.interviews?.length" class="mt-3 flex flex-col gap-2">
            <div
              v-for="interview in application.interviews"
              :key="interview.id"
              class="rounded-md bg-purple-50 p-3 text-sm text-purple-800"
            >
              <p class="font-medium">📅 Intervistë e caktuar — {{ formatInterviewDate(interview.scheduled_at) }}</p>
              <p class="text-purple-600">{{ typeLabels[interview.type] }}</p>
              <p v-if="interview.location" class="text-purple-600">📍 {{ interview.location }}</p>
              <a v-if="interview.meeting_url" :href="interview.meeting_url" target="_blank" class="text-purple-600 underline">
                🔗 {{ interview.meeting_url }}
              </a>
              <p v-if="interview.notes" class="mt-1 text-purple-600">{{ interview.notes }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
