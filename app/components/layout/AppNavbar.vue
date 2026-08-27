<script setup lang="ts">
const authStore = useAuthStore()
const { logout } = useAuth()

async function onLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <nav class="border-b border-gray-200 bg-white px-4 py-3">
    <div class="mx-auto flex max-w-4xl items-center justify-between">
      <NuxtLink to="/jobs" class="text-lg font-semibold text-gray-900">SmartJob</NuxtLink>

      <div class="flex items-center gap-4 text-sm">
        <NuxtLink to="/jobs" class="text-gray-600 hover:text-gray-900">Jobs</NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/profile" class="text-gray-600 hover:text-gray-900">
            My profile
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/my-applications" class="text-gray-600 hover:text-gray-900">
            My applications
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/saved-jobs" class="text-gray-600 hover:text-gray-900">
            Saved jobs
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/company" class="text-gray-600 hover:text-gray-900">
            My company
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/jobs" class="text-gray-600 hover:text-gray-900">
            My jobs
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'candidate' || authStore.user?.role === 'employer'"
            to="/messages"
            class="text-gray-600 hover:text-gray-900"
          >
            Messages
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin/users" class="text-gray-600 hover:text-gray-900">
            Users
          </NuxtLink>
          <button class="font-medium text-red-600 hover:underline" @click="onLogout">Log out</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-gray-600 hover:text-gray-900">Log in</NuxtLink>
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:underline">Register</NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
