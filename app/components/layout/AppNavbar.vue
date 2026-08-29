<script setup lang="ts">
const authStore = useAuthStore()
const { logout } = useAuth()
const route = useRoute()
const { resolveUrl } = useBackendOrigin()
const { items: notifications, unreadCount, fetchMine: fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

async function onLogout() {
  mobileMenuOpen.value = false
  await logout()
  await navigateTo('/login')
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const showNotifications = ref(false)
const notificationsRef = ref<HTMLElement | null>(null)
const mobileMenuOpen = ref(false)
let pollInterval: ReturnType<typeof setInterval> | undefined

function onOutsideClick(event: MouseEvent) {
  if (showNotifications.value && notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
    showNotifications.value = false
  }
}

function formatRelative(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return 'tani'
  if (mins < 60) return `${mins} min më parë`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} orë më parë`
  return `${Math.floor(hours / 24)} ditë më parë`
}

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) fetchNotifications()
  },
  { immediate: true },
)

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
  pollInterval = setInterval(() => {
    if (authStore.isAuthenticated) fetchNotifications()
  }, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  if (pollInterval) clearInterval(pollInterval)
})

const navLinkClass = (path: string) =>
  isActive(path) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
</script>

<template>
  <nav class="sticky top-0 z-20 border-b border-gray-100 bg-white/80 shadow-sm shadow-gray-100/50 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <NuxtLink to="/jobs" class="flex shrink-0 items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 text-sm font-extrabold text-white shadow-md shadow-brand-200">
          SJ
        </span>
        <span class="text-lg font-extrabold tracking-tight text-gray-900">Smart<span class="text-brand-600">Job</span></span>
      </NuxtLink>

      <!-- Desktop nav -->
      <div class="hidden items-center gap-1 text-sm md:flex">
        <NuxtLink to="/jobs" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/jobs')">
          Jobs
        </NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/profile" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/profile')">
            My profile
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/my-applications" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/my-applications')">
            My applications
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/saved-jobs" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/saved-jobs')">
            Saved jobs
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/company" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/employer/company')">
            My company
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/jobs" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/employer/jobs')">
            My jobs
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate' || authStore.user?.role === 'employer'" to="/messages" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/messages')">
            Messages
          </NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin/users" class="rounded-lg px-3 py-1.5 font-medium transition" :class="navLinkClass('/admin/users')">
            Users
          </NuxtLink>

          <div ref="notificationsRef" class="relative ml-1">
            <button
              type="button"
              class="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
              title="Njoftimet"
              @click="showNotifications = !showNotifications"
            >
              🔔
              <span
                v-if="unreadCount > 0"
                class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg"
            >
              <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span class="text-sm font-semibold text-gray-900">Njoftimet</span>
                <button v-if="unreadCount > 0" type="button" class="text-xs font-medium text-brand-600 hover:underline" @click="markAllAsRead">
                  Shëno të gjitha si të lexuara
                </button>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <p v-if="!notifications.length" class="px-4 py-6 text-center text-sm text-gray-400">
                  S'ke njoftime ende.
                </p>
                <button
                  v-for="notification in notifications"
                  :key="notification.id"
                  type="button"
                  class="flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-gray-50"
                  :class="!notification.read_at ? 'bg-brand-50/40' : ''"
                  @click="markAsRead(notification.id)"
                >
                  <span class="flex items-center gap-2">
                    <span v-if="!notification.read_at" class="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    <span class="text-sm font-medium text-gray-900">{{ notification.title }}</span>
                  </span>
                  <span class="text-sm text-gray-600">{{ notification.message }}</span>
                  <span class="text-xs text-gray-400">{{ formatRelative(notification.created_at) }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="ml-2 flex items-center gap-2 border-l border-gray-100 pl-3">
            <span class="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-sm font-medium text-gray-700">
              <span v-if="authStore.user?.avatar_url" class="h-7 w-7 overflow-hidden rounded-full ring-2 ring-brand-100">
                <img :src="resolveUrl(authStore.user.avatar_url) ?? undefined" alt="" class="h-full w-full object-cover">
              </span>
              <span v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                {{ authStore.user?.name?.[0]?.toUpperCase() }}
              </span>
              <span class="max-w-[8rem] truncate">{{ authStore.user?.name }}</span>
            </span>
            <button class="rounded-lg px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50" @click="onLogout">
              Log out
            </button>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900">
            Log in
          </NuxtLink>
          <NuxtLink to="/register" class="ml-1 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 font-semibold text-white shadow-sm shadow-brand-200 transition hover:from-brand-700 hover:to-brand-600">
            Register
          </NuxtLink>
        </template>
      </div>

      <!-- Mobile controls -->
      <div class="flex items-center gap-1 md:hidden">
        <div v-if="authStore.isAuthenticated" ref="notificationsRef" class="relative">
          <button
            type="button"
            class="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-50"
            title="Njoftimet"
            @click="showNotifications = !showNotifications"
          >
            🔔
            <span
              v-if="unreadCount > 0"
              class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <div
            v-if="showNotifications"
            class="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white shadow-lg"
          >
            <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span class="text-sm font-semibold text-gray-900">Njoftimet</span>
              <button v-if="unreadCount > 0" type="button" class="text-xs font-medium text-brand-600 hover:underline" @click="markAllAsRead">
                Të gjitha
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <p v-if="!notifications.length" class="px-4 py-6 text-center text-sm text-gray-400">S'ke njoftime ende.</p>
              <button
                v-for="notification in notifications"
                :key="notification.id"
                type="button"
                class="flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-gray-50"
                :class="!notification.read_at ? 'bg-brand-50/40' : ''"
                @click="markAsRead(notification.id)"
              >
                <span class="text-sm font-medium text-gray-900">{{ notification.title }}</span>
                <span class="text-sm text-gray-600">{{ notification.message }}</span>
                <span class="text-xs text-gray-400">{{ formatRelative(notification.created_at) }}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50"
          :aria-expanded="mobileMenuOpen"
          aria-label="Menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span v-if="!mobileMenuOpen" class="text-xl leading-none">☰</span>
          <span v-else class="text-xl leading-none">✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div v-if="mobileMenuOpen" class="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
      <div class="flex flex-col gap-1 text-sm">
        <NuxtLink to="/jobs" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/jobs')">Jobs</NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/profile" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/profile')">My profile</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/my-applications" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/my-applications')">My applications</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate'" to="/saved-jobs" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/saved-jobs')">Saved jobs</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/company" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/employer/company')">My company</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'employer'" to="/employer/jobs" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/employer/jobs')">My jobs</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'candidate' || authStore.user?.role === 'employer'" to="/messages" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/messages')">Messages</NuxtLink>
          <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin/users" class="rounded-lg px-3 py-2 font-medium transition" :class="navLinkClass('/admin/users')">Users</NuxtLink>

          <div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
            <span class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span v-if="authStore.user?.avatar_url" class="h-7 w-7 overflow-hidden rounded-full ring-2 ring-brand-100">
                <img :src="resolveUrl(authStore.user.avatar_url) ?? undefined" alt="" class="h-full w-full object-cover">
              </span>
              <span v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                {{ authStore.user?.name?.[0]?.toUpperCase() }}
              </span>
              {{ authStore.user?.name }}
            </span>
            <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50" @click="onLogout">
              Log out
            </button>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="rounded-lg px-3 py-2 font-medium text-gray-600 transition hover:bg-gray-50">Log in</NuxtLink>
          <NuxtLink to="/register" class="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-2 font-semibold text-white shadow-sm">Register</NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
