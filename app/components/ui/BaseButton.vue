<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
    fullWidth?: boolean
  }>(),
  { fullWidth: true },
)
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled || loading"
    class="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    :class="fullWidth ? 'w-full' : ''"
  >
    <span v-if="loading">Loading...</span>
    <slot v-else />
  </button>
</template>
