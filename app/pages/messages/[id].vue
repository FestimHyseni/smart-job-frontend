<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const conversationId = Number(route.params.id)

const authStore = useAuthStore()
const { current, loading, error, otherParticipant, fetchThread, send } = useMessaging()

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
  poll = setInterval(() => fetchThread(conversationId), 5000)
})

onUnmounted(() => {
  if (poll) clearInterval(poll)
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 px-4 py-10">
    <div class="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <NuxtLink to="/messages" class="mb-4 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Të gjitha bisedat
      </NuxtLink>

      <p v-if="loading && !current" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <template v-else-if="current">
        <h1 class="mb-4 text-lg font-semibold text-gray-900">{{ otherParticipant(current)?.name }}</h1>

        <div class="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-gray-100 bg-white p-4">
          <p v-if="!current.messages.length" class="text-sm text-gray-400">Ende s'ka mesazhe. Fillo bisedën!</p>
          <div
            v-for="message in current.messages"
            :key="message.id"
            class="flex flex-col"
            :class="message.sender_id === authStore.user?.id ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-xs rounded-lg px-3 py-2 text-sm"
              :class="message.sender_id === authStore.user?.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'"
            >
              {{ message.message }}
            </div>
            <span class="mt-1 text-xs text-gray-400">{{ formatTime(message.created_at) }}</span>
          </div>
        </div>

        <form class="mt-4 flex gap-2" @submit.prevent="onSend">
          <input
            v-model="draft"
            type="text"
            placeholder="Shkruaj një mesazh..."
            class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
          <BaseButton type="submit" :full-width="false" :loading="sending" class="px-5">Dërgo</BaseButton>
        </form>
      </template>
    </div>
  </div>
</template>
