<script setup lang="ts">
import type { Skill } from '~/types/profileExtras'
import type { SkillImportance } from '~/types/jobSkill'
import { useCatalogService } from '~/services/catalog'

const props = defineProps<{
  jobId: number
}>()

const jobSkills = useJobSkills()
const catalogService = useCatalogService()

const skillsCatalog = ref<Skill[]>([])
const newSkillId = ref<number | ''>('')
const newImportance = ref<SkillImportance>('required')

const importanceLabels: Record<SkillImportance, string> = {
  required: 'E domosdoshme',
  preferred: 'E preferuar',
}

onMounted(async () => {
  skillsCatalog.value = await catalogService.listSkills()
  await jobSkills.fetchFor(props.jobId)
})

async function onAdd() {
  if (!newSkillId.value) return
  await jobSkills.add(props.jobId, Number(newSkillId.value), newImportance.value)
  newSkillId.value = ''
  newImportance.value = 'required'
}
</script>

<template>
  <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
    <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">🛠️ Aftësitë e kërkuara</h2>
    <p class="mb-4 text-sm text-gray-500">
      Këto aftësi përdoren për të përputhur job-in me CV-të e kandidatëve tek rekomandimet.
    </p>

    <p v-if="!jobSkills.items.value.length" class="mb-4 text-sm text-gray-400">Ende s'ke shtuar aftësi.</p>
    <div v-else class="mb-5 flex flex-wrap gap-2">
      <span
        v-for="js in jobSkills.items.value"
        :key="js.id"
        class="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
        :class="js.importance === 'required' ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-700'"
      >
        {{ js.skill?.name }} <span class="text-xs opacity-70">· {{ importanceLabels[js.importance] }}</span>
        <button type="button" class="opacity-60 hover:text-red-600 hover:opacity-100" @click="jobSkills.remove(js.id)">×</button>
      </span>
    </div>

    <div class="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-4">
      <BaseSelect v-model="newSkillId" label="Shto aftësi" placeholder="Zgjedh aftësinë" :options="skillsCatalog.map((s) => ({ value: s.id, label: s.name }))" />
      <BaseSelect
        v-model="newImportance"
        label="Rëndësia"
        :options="[
          { value: 'required', label: 'E domosdoshme' },
          { value: 'preferred', label: 'E preferuar' },
        ]"
      />
      <BaseButton type="button" :full-width="false" class="px-5" @click="onAdd">+ Shto</BaseButton>
    </div>
  </div>
</template>
