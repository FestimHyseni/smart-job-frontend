<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const conversationId = Number(route.params.id)

const authStore = useAuthStore()
const { current, loading, error, otherParticipant, fetchThread, send, markThreadRead } = useMessaging()

const draft = ref('')
const sending = ref(false)

async function onSend() {
  if (!draft.value.trim()) return
  sending.value = true
  try {
    await send(conversationId, draft.value)
    draft.value = ''
  } finally {
    sending.value = false
  }
}

function formatTime(date: string) {
  return new Date(date).toLocaleString('sq-AL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

let poll: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  await fetchThread(conversationId)
  if (current.value) await markThreadRead(current.value)
  poll = setInterval(async () => {
    await fetchThread(conversationId)
    if (current.value) await markThreadRead(current.value)
  }, 5000)
})

onUnmounted(() => {
  if (poll) clearInterval(poll)
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 px-4 py-10 dark:bg-gray-950">
    <div class="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <NuxtLink to="/messages" class="mb-4 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Të gjitha bisedat
      </NuxtLink>

      <p v-if="loading && !current" class="text-sm text-gray-600 dark:text-gray-400">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <template v-else-if="current">
        <h1 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{{ otherParticipant(current)?.name }}</h1>

        <div class="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p v-if="!current.messages.length" class="text-sm text-gray-400 dark:text-gray-400">Ende s'ka mesazhe. Fillo bisedën!</p>
          <div
            v-for="(message, index) in current.messages"
            :key="message.id"
            class="flex flex-col"
            :class="message.sender_id === authStore.user?.id ? 'items-end' : 'items-start'"
          >
            <div class="flex items-center gap-1.5" :class="message.sender_id === authStore.user?.id ? 'flex-row-reverse' : 'flex-row'">
              <div
                class="max-w-xs rounded-lg px-3 py-2 text-sm"
                :class="message.sender_id === authStore.user?.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'"
              >
                {{ message.message }}
              </div>
              <span
                class="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                :title="`Mesazhi nr. ${index + 1} në këtë bisedë`"
              >
                #{{ index + 1 }}
              </span>
            </div>
            <span class="mt-1 text-xs text-gray-400 dark:text-gray-400">{{ formatTime(message.created_at) }}</span>
          </div>
        </div>

        <form class="mt-4 flex gap-2" @submit.prevent="onSend">
          <input
            v-model="draft"
            type="text"
            placeholder="Shkruaj një mesazh..."
            class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
          <BaseButton type="submit" :full-width="false" :loading="sending" class="px-5">Dërgo</BaseButton>
        </form>
      </template>
    </div>
  </div>
</template>
