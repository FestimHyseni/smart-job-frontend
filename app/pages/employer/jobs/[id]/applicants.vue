<script setup lang="ts">
import type { ApplicationStatus } from '~/types/application'
import { useBackendOrigin } from '~/composables/useBackendOrigin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const jobId = Number(route.params.id)

const { applications, loading, error, fetchApplicationsFor, updateApplicationStatus } = useEmployerJobs()
const { resolveUrl } = useBackendOrigin()
const { findOrStartConversationWith } = useMessaging()
const messaging = ref<number | null>(null)

async function onMessage(candidateId: number) {
  messaging.value = candidateId
  try {
    const conversation = await findOrStartConversationWith(candidateId)
    await navigateTo(`/messages/${conversation.id}`)
  } finally {
    messaging.value = null
  }
}

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

async function onStatusChange(applicationId: number, event: Event) {
  const status = (event.target as HTMLSelectElement).value as ApplicationStatus
  await updateApplicationStatus(applicationId, status)
}

onMounted(() => fetchApplicationsFor(jobId))
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/employer/jobs" class="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline">
        ← Të gjitha job-et
      </NuxtLink>

      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Aplikantët</h1>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!applications.length" class="text-sm text-gray-500">Ende s'ka aplikantë për këtë job.</p>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="application in applications" :key="application.id" class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium text-gray-900">{{ application.candidate?.name }}</p>
              <p class="text-sm text-gray-500">{{ application.candidate?.email }}</p>
              <a
                v-if="application.resume"
                :href="resolveUrl(application.resume.file_url) ?? '#'"
                target="_blank"
                class="mt-1 inline-block text-sm text-blue-600 hover:underline"
              >
                📎 {{ application.resume.file_name }}
              </a>
            </div>
            <select
              class="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              :value="application.status"
              @change="onStatusChange(application.id, $event)"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <p v-if="application.cover_letter" class="mt-3 whitespace-pre-line text-sm text-gray-600">{{ application.cover_letter }}</p>

          <div class="mt-4 border-t border-gray-100 pt-3">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="messaging === application.candidate_id"
              @click="onMessage(application.candidate_id)"
            >
              <span v-if="messaging === application.candidate_id">Duke hapur...</span>
              <span v-else>💬 Kontakto kandidatin</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
