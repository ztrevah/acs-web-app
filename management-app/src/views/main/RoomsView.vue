<script setup>
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import RoomsTable from '@/components/main/rooms/RoomsTable.vue'

const crumbItems = [
  {
    name: 'Rooms',
    link: '/rooms',
  },
]
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <RoomsTable />
    </div>
  </MainLayout>
</template>
