<script setup lang="ts">
import type { ApplicationStatus } from '~/types/application'

defineProps<{
  status: ApplicationStatus
}>()

const labels: Record<ApplicationStatus, string> = {
  pending: 'Në pritje',
  reviewed: 'Shqyrtuar',
  shortlisted: 'I përzgjedhur',
  interview: 'Intervistë',
  accepted: 'I pranuar',
  rejected: 'I refuzuar',
}

const colors: Record<ApplicationStatus, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  reviewed: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  shortlisted: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  interview: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}
</script>

<template>
  <span class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium" :class="colors[status]">
    {{ labels[status] }}
  </span>
</template>
