<script setup lang="ts">
const { login, loading, error, fieldErrors } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

async function onSubmit() {
  try {
    await login(form)
    await navigateTo('/jobs')
  } catch {
    // error state is already handled by useAuth
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-gray-50 to-white px-4 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
    <div class="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-6 flex flex-col items-center">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-lg font-bold text-white shadow">
          SJ
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Kyçu</h1>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="ti@example.com"
          :error="fieldErrors.email?.[0]"
        />
        <BaseInput
          v-model="form.password"
          label="Fjalëkalimi"
          type="password"
          placeholder="••••••••"
          :error="fieldErrors.password?.[0]"
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <BaseButton type="submit" :loading="loading">Kyçu</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        S'ke llogari?
        <NuxtLink to="/register" class="font-medium text-brand-600 hover:underline">Regjistrohu</NuxtLink>
      </p>
    </div>
  </div>
</template>
