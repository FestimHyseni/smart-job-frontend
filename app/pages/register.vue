<script setup lang="ts">
import type { RegisterPayload } from '~/types/auth'

const { register, loading, error, fieldErrors } = useAuth()

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'candidate',
  phone: '',
})

async function onSubmit() {
  try {
    await register(form)
    await navigateTo('/jobs')
  } catch {
    // error state is already handled by useAuth
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-sm rounded-lg bg-white p-8 shadow">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Create account</h1>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.name"
          label="Full name"
          placeholder="John Doe"
          :error="fieldErrors.name?.[0]"
        />
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
        <BaseInput
          v-model="form.password_confirmation"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
        />

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">I am a</label>
          <select
            v-model="form.role"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
          <p v-if="fieldErrors.role?.[0]" class="text-sm text-red-600">{{ fieldErrors.role[0] }}</p>
        </div>

        <BaseInput
          v-model="form.phone"
          label="Phone (optional)"
          type="tel"
          placeholder="+383 44 000 000"
          :error="fieldErrors.phone?.[0]"
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <BaseButton type="submit" :loading="loading">Create account</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-brand-600 hover:underline">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>
