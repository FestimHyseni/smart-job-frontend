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
  pending: 'bg-gray-100 text-gray-600',
  reviewed: 'bg-cyan-50 text-cyan-700',
  shortlisted: 'bg-blue-50 text-blue-700',
  interview: 'bg-purple-50 text-purple-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}
</script>

<template>
  <span class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium" :class="colors[status]">
    {{ labels[status] }}
  </span>
</template>
