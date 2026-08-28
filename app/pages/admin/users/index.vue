<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { users, loading, error, fetchUsers } = useUsers()

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

      <p v-if="loading" class="text-sm text-gray-600">Loading users...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="!users.length" class="text-sm text-gray-600">No users found.</p>

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
            <tr v-for="user in users" :key="user.id">
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
