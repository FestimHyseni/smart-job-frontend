<script setup lang="ts">
import type { UpdateUserPayload } from '~/types/user'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const userId = Number(route.params.id)

const { loading, error, fieldErrors, fetchUser, updateUser } = useUsers()

const form = reactive<UpdateUserPayload>({
  name: '',
  email: '',
  password: '',
  role: 'candidate',
  phone: '',
})

const notFound = ref(false)

onMounted(async () => {
  try {
    const user = await fetchUser(userId)
    if (user) {
      form.name = user.name
      form.email = user.email
      form.role = user.role
      form.phone = user.phone ?? ''
    }
  } catch {
    notFound.value = true
  }
})

async function onSubmit() {
  try {
    await updateUser(userId, form)
    await navigateTo('/admin/users')
  } catch {
    // error state is already handled by useUsers
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Edit user</h1>

      <p v-if="notFound" class="text-sm text-red-600">User not found.</p>

      <form v-else class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.name" label="Full name" placeholder="John Doe" :error="fieldErrors.name?.[0]" />
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          :error="fieldErrors.email?.[0]"
        />
        <BaseInput
          v-model="form.password"
          label="New password (optional)"
          type="password"
          placeholder="Leave blank to keep current password"
          :error="fieldErrors.password?.[0]"
        />

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="form.role"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
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

        <BaseButton type="submit" :loading="loading">Save changes</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        <NuxtLink to="/admin/users" class="font-medium text-brand-600 hover:underline">Back to users</NuxtLink>
      </p>
    </div>
  </div>
</template>
