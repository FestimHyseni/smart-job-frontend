<script setup lang="ts">
import type { Job } from '~/types/job'

const props = defineProps<{
  job: Job
  active?: boolean
  saved?: boolean
  showSave?: boolean
  matchScore?: number
}>()

const emit = defineEmits<{
  select: [job: Job]
  toggleSave: [jobId: number]
}>()

function onToggleSave(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  emit('toggleSave', props.job.id)
}

const daysAgo = computed(() => {
  const diff = Date.now() - new Date(props.job.created_at).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Sot'
  if (days === 1) return '1 ditë'
  return `${days} ditë`
})
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-0 hover:bg-gray-50"
    :class="active ? 'bg-brand-50/70' : ''"
    @click="emit('select', job)"
    @keydown.enter="emit('select', job)"
  >
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
      {{ job.company?.name?.[0]?.toUpperCase() || '?' }}
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold" :class="active ? 'text-brand-700' : 'text-gray-900'">{{ job.title }}</p>
      <p class="truncate text-xs text-gray-500">{{ job.company?.name }}</p>
      <div class="mt-1 flex items-center gap-3 text-xs text-gray-400">
        <span v-if="job.location">📍 {{ job.location.city }}</span>
        <span>🕐 {{ daysAgo }}</span>
        <span v-if="matchScore" class="rounded-full bg-green-50 px-1.5 py-0.5 font-medium text-green-700">🎯 {{ matchScore }}</span>
      </div>
    </div>
    <button
      v-if="showSave"
      type="button"
      class="shrink-0 text-lg leading-none transition"
      :class="saved ? 'text-green-600' : 'text-gray-300 hover:text-gray-400'"
      :title="saved ? 'Hiq nga të ruajturat' : 'Ruaj këtë job'"
      @click="onToggleSave"
    >
      {{ saved ? '★' : '☆' }}
    </button>
  </div>
</template>
