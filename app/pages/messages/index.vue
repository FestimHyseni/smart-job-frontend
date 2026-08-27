<script setup lang="ts">
import type { Conversation } from '~/types/messaging'

definePageMeta({ middleware: 'auth' })

const { conversations, loading, error, otherParticipant, fetchMine } = useMessaging()

function lastMessagePreview(conversation: Conversation) {
  const last = conversation.messages[conversation.messages.length - 1]
  return last?.message ?? 'Ende s\'ka mesazhe.'
}

onMounted(fetchMine)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Mesazhet</h1>

      <p v-if="loading" class="text-sm text-gray-600">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!conversations.length" class="text-sm text-gray-500">Ende s'ke asnjë bisedë.</p>

      <ul v-else class="flex flex-col gap-2">
        <li v-for="conversation in conversations" :key="conversation.id">
          <NuxtLink
            :to="`/messages/${conversation.id}`"
            class="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-300"
          >
            <div>
              <p class="font-medium text-gray-900">{{ otherParticipant(conversation)?.name ?? 'Unknown' }}</p>
              <p class="truncate text-sm text-gray-500">{{ lastMessagePreview(conversation) }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
