<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { users, loading, error, fetchUsers } = useUsers()

const search = ref('')
const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q),
  )
})

onMounted(fetchUsers)
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
        <NuxtLink
          to="/admin/users/create"
          class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add user
        </NuxtLink>
      </div>

      <div class="relative mb-4">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Kërko sipas emrit, email-it ose rolit..."
          class="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
        >
      </div>

      <p v-if="loading" class="text-sm text-gray-600">Loading users...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!users.length" class="text-sm text-gray-600">No users found.</p>
      <p v-else-if="!filteredUsers.length" class="text-sm text-gray-500">Asnjë rezultat për "{{ search }}".</p>

      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Name</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Email</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Role</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-4 py-3 text-gray-900">{{ user.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-3 text-gray-600 capitalize">{{ user.role }}</td>
              <td class="px-4 py-3 text-gray-600">{{ user.phone || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/admin/users/${user.id}/edit`"
                  class="font-medium text-brand-600 hover:underline"
                >
                  Edit
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
