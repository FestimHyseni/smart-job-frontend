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
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm rounded-lg bg-white p-8 shadow">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Log in</h1>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          :error="fieldErrors.email?.[0]"
        />
        <BaseInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="fieldErrors.password?.[0]"
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <BaseButton type="submit" :loading="loading">Log in</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Don't have an account?
        <NuxtLink to="/register" class="font-medium text-blue-600 hover:underline">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>
