<script setup lang="ts">
const authStore = useAuthStore()
const { logout } = useAuth()
const route = useRoute()
const { resolveUrl } = useBackendOrigin()

async function onLogout() {
  await logout()
  await navigateTo('/login')
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <NuxtLink to="/jobs" class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold text-white shadow-sm">
          SJ
        </span>
        <span class="text-lg font-extrabold tracking-tight text-gray-900">Smart<span class="text-brand-600">Job</span></span>
      </NuxtLink>

      <div class="flex items-center gap-1 text-sm">
        <NuxtLink
          to="/jobs"
          class="rounded-md px-3 py-1.5 font-medium transition"
          :class="isActive('/jobs') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          Jobs
        </NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink
            v-if="authStore.user?.role === 'candidate'"
            to="/profile"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/profile') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            My profile
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'candidate'"
            to="/my-applications"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/my-applications') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            My applications
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'candidate'"
            to="/saved-jobs"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/saved-jobs') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            Saved jobs
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'employer'"
            to="/employer/company"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/employer/company') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            My company
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'employer'"
            to="/employer/jobs"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/employer/jobs') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            My jobs
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'candidate' || authStore.user?.role === 'employer'"
            to="/messages"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/messages') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            Messages
          </NuxtLink>
          <NuxtLink
            v-if="authStore.user?.role === 'admin'"
            to="/admin/users"
            class="rounded-md px-3 py-1.5 font-medium transition"
            :class="isActive('/admin/users') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            Users
          </NuxtLink>
          <div class="ml-2 flex items-center gap-2 border-l border-gray-100 pl-3">
            <span class="flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm font-medium text-gray-700">
              <span
                v-if="authStore.user?.avatar_url"
                class="h-6 w-6 overflow-hidden rounded-full bg-gray-200"
              >
                <img :src="resolveUrl(authStore.user.avatar_url) ?? undefined" alt="" class="h-full w-full object-cover">
              </span>
              <span
                v-else
                class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
              >
                {{ authStore.user?.name?.[0]?.toUpperCase() }}
              </span>
              <span class="max-w-[8rem] truncate">{{ authStore.user?.name }}</span>
            </span>
            <button
              class="rounded-md px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50"
              @click="onLogout"
            >
              Log out
            </button>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="rounded-md px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900">
            Log in
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="ml-1 rounded-md bg-brand-600 px-3 py-1.5 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Register
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
