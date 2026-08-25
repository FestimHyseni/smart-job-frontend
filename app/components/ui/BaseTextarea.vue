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
    <label class="text-sm font-medium text-gray-700">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows || 4"
      class="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      :class="error ? 'border-red-500' : 'border-gray-300'"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
