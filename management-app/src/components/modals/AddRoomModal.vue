<script setup>
import Dialog from 'primevue/dialog'
defineProps({
  visible,
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap">Add a new room</span>
      </div>
    </template>
    <span class="text-surface-500 dark:text-surface-400 block mb-8"
      >Enter new room's information.</span
    >
    <div class="flex items-center gap-4 mb-4">
      <label for="name" class="font-semibold w-24">Name</label>
      <InputText id="name" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-2">
      <label for="email" class="font-semibold w-24">Email</label>
      <InputText id="email" class="flex-auto" autocomplete="off" />
    </div>
    <template #footer>
      <Button label="Create" outlined severity="secondary" @click="visible = false" autofocus />
    </template>
  </Dialog>
</template>
