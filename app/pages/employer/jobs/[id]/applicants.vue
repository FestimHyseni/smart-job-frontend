<script setup lang="ts">
import type { ApplicationStatus } from '~/types/application'
import type { InterviewType } from '~/types/interview'
import { useBackendOrigin } from '~/composables/useBackendOrigin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const jobId = Number(route.params.id)

const { applications, loading, error, fetchApplicationsFor, updateApplicationStatus, scheduleInterview } = useEmployerJobs()
const { resolveUrl } = useBackendOrigin()

const search = ref('')
const filteredApplications = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return applications.value
  return applications.value.filter(
    (application) => application.candidate?.name.toLowerCase().includes(q) || application.candidate?.email.toLowerCase().includes(q),
  )
})
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

const schedulingFor = ref<number | null>(null)
const scheduling = ref(false)
const interviewForm = reactive({
  scheduled_at: '',
  type: 'online' as InterviewType,
  location: '',
  meeting_url: '',
  notes: '',
})

function toggleSchedule(applicationId: number) {
  schedulingFor.value = schedulingFor.value === applicationId ? null : applicationId
  Object.assign(interviewForm, { scheduled_at: '', type: 'online', location: '', meeting_url: '', notes: '' })
}

async function onScheduleInterview(applicationId: number) {
  scheduling.value = true
  try {
    await scheduleInterview({
      application_id: applicationId,
      scheduled_at: interviewForm.scheduled_at,
      type: interviewForm.type,
      location: interviewForm.type === 'physical' ? interviewForm.location : null,
      meeting_url: interviewForm.type === 'online' ? interviewForm.meeting_url : null,
      notes: interviewForm.notes || null,
    })
    schedulingFor.value = null
  } finally {
    scheduling.value = false
  }
}

function formatInterviewDate(date: string) {
  return new Date(date).toLocaleString('sq-AL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
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
      <NuxtLink to="/employer/jobs" class="mb-6 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Të gjitha job-et
      </NuxtLink>

      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Aplikantët</h1>

      <div v-if="applications.length" class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas emrit ose email-it..."
          class="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!applications.length" class="text-sm text-gray-500">Ende s'ka aplikantë për këtë job.</p>
      <p v-else-if="!filteredApplications.length" class="text-sm text-gray-500">Asnjë rezultat për "{{ search }}".</p>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="application in filteredApplications" :key="application.id" class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
          <div class="flex items-start justify-between gap-4">
            <div>
              <NuxtLink
                :to="`/candidates/${application.candidate_id}`"
                class="font-medium text-gray-900 hover:text-brand-600 hover:underline"
              >
                {{ application.candidate?.name }}
              </NuxtLink>
              <p class="text-sm text-gray-500">{{ application.candidate?.email }}</p>
              <a
                v-if="application.resume"
                :href="resolveUrl(application.resume.file_url) ?? '#'"
                target="_blank"
                class="mt-1 inline-block text-sm text-brand-600 hover:underline"
              >
                📎 {{ application.resume.file_name }}
              </a>
            </div>
            <select
              class="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              :value="application.status"
              @change="onStatusChange(application.id, $event)"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <p v-if="application.cover_letter" class="mt-3 whitespace-pre-line text-sm text-gray-600">{{ application.cover_letter }}</p>

          <div v-if="application.experience_summary || application.languages" class="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-sm">
            <p v-if="application.experience_summary" class="text-gray-700">
              <span class="font-medium text-gray-900">💼 Përvoja:</span> {{ application.experience_summary }}
            </p>
            <p v-if="application.languages" class="text-gray-700">
              <span class="font-medium text-gray-900">🌐 Gjuhët:</span> {{ application.languages }}
            </p>
          </div>

          <div v-if="application.interviews?.length" class="mt-3 flex flex-col gap-1">
            <div
              v-for="interview in application.interviews"
              :key="interview.id"
              class="rounded-md bg-purple-50 px-3 py-2 text-sm text-purple-700"
            >
              📅 Intervistë {{ formatInterviewDate(interview.scheduled_at) }} ({{ interview.type }})
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="messaging === application.candidate_id"
              @click="onMessage(application.candidate_id)"
            >
              <span v-if="messaging === application.candidate_id">Duke hapur...</span>
              <span v-else>💬 Kontakto kandidatin</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition hover:bg-purple-600 hover:text-white"
              @click="toggleSchedule(application.id)"
            >
              📅 {{ schedulingFor === application.id ? 'Mbyll' : 'Cakto intervistë' }}
            </button>
          </div>

          <form
            v-if="schedulingFor === application.id"
            class="mt-3 flex flex-col gap-3 rounded-lg bg-gray-50 p-4"
            @submit.prevent="onScheduleInterview(application.id)"
          >
            <BaseInput v-model="interviewForm.scheduled_at" label="Data dhe ora" type="datetime-local" />
            <BaseSelect
              v-model="interviewForm.type"
              label="Lloji"
              :options="[
                { value: 'online', label: 'Online' },
                { value: 'physical', label: 'Fizike' },
                { value: 'phone', label: 'Telefonike' },
              ]"
            />
            <BaseInput v-if="interviewForm.type === 'physical'" v-model="interviewForm.location" label="Vendndodhja" placeholder="Adresa e zyrës" />
            <BaseInput v-if="interviewForm.type === 'online'" v-model="interviewForm.meeting_url" label="Link takimi" placeholder="https://meet.google.com/..." />
            <BaseTextarea v-model="interviewForm.notes" label="Shënime (opsionale)" />
            <BaseButton type="submit" :full-width="false" :loading="scheduling" class="self-start px-5">Cakto intervistën</BaseButton>
          </form>
        </li>
      </ul>
    </div>
  </div>
</template>
