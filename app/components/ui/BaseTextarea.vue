<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  error?: string
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows || 4"
      class="rounded-md border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
      :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>
