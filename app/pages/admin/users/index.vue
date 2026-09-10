<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { users, loading, error, fetchUsers, deleteUser } = useUsers()
const authStore = useAuthStore()

const search = ref('')
const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q),
  )
})

const deletingId = ref<number | null>(null)

async function onDelete(userId: number, userName: string) {
  if (!confirm(`Të fshihet përdoruesi "${userName}"? Ky veprim nuk mund të kthehet.`)) return

  deletingId.value = userId
  try {
    await deleteUser(userId)
  } catch {
    // error is already surfaced via the `error` ref
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Përdoruesit</h1>
        <NuxtLink
          to="/admin/users/create"
          class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Shto përdorues
        </NuxtLink>
      </div>

      <div class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas emrit, email-it ose rolit..."
          class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600 dark:text-gray-400">Duke ngarkuar...</p>
      <p v-else-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <p v-else-if="!users.length" class="text-sm text-gray-600 dark:text-gray-400">S'u gjet asnjë përdorues.</p>
      <p v-else-if="!filteredUsers.length" class="text-sm text-gray-500 dark:text-gray-400">Asnjë rezultat për "{{ search }}".</p>

      <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-950">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Emri</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Email</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Roli</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Telefoni</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="user in filteredUsers" :key="user.id" class="transition hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-3 text-gray-900 dark:text-white">{{ user.name }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-4 py-3 text-gray-600 capitalize dark:text-gray-400">{{ user.role }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.phone || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/admin/users/${user.id}/edit`"
                  class="font-medium text-brand-600 hover:underline"
                >
                  Edito
                </NuxtLink>
                <button
                  v-if="user.id !== authStore.user?.id"
                  type="button"
                  class="ml-3 font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                  :disabled="deletingId === user.id"
                  @click="onDelete(user.id, user.name)"
                >
                  {{ deletingId === user.id ? 'Duke fshirë...' : 'Fshi' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
