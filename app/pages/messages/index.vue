<script setup lang="ts">
import type { Conversation } from '~/types/messaging'

definePageMeta({ middleware: 'auth' })

const { conversations, loading, error, otherParticipant, fetchMine } = useMessaging()

function lastMessagePreview(conversation: Conversation) {
  const last = conversation.messages[conversation.messages.length - 1]
  return last?.message ?? 'Ende s\'ka mesazhe.'
}

const search = ref('')
const filteredConversations = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter((c) => otherParticipant(c)?.name.toLowerCase().includes(q))
})

onMounted(fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Mesazhet</h1>

      <div v-if="conversations.length" class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas emrit..."
          class="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!conversations.length" class="text-sm text-gray-500">Ende s'ke asnjë bisedë.</p>
      <p v-else-if="!filteredConversations.length" class="text-sm text-gray-500">Asnjë rezultat për "{{ search }}".</p>

      <ul v-else class="flex flex-col gap-2">
        <li v-for="conversation in filteredConversations" :key="conversation.id">
          <NuxtLink
            :to="`/messages/${conversation.id}`"
            class="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <div>
              <p class="font-medium text-gray-900">{{ otherParticipant(conversation)?.name ?? 'I panjohur' }}</p>
              <p class="truncate text-sm text-gray-500">{{ lastMessagePreview(conversation) }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
