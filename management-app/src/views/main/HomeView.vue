<script setup>
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import StatisticCard from '@/components/main/home/StatisticCard.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import RoomIcon from '@/components/icons/RoomIcon.vue'
import LogIcon from '@/components/icons/LogIcon.vue'
import DeviceIcon from '@/components/icons/DeviceIcon.vue'

const cardItem = [
  {
    title: 'Total Rooms',
    value: 100,
    icon: RoomIcon,
  },
]

const crumbItems = [
  {
    name: 'Homepage',
    link: '/',
  },
]
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatisticCard title="Total Rooms" :value="100" :icon="RoomIcon" />

        <StatisticCard title="Total Devices" :value="100" :icon="DeviceIcon" />

        <StatisticCard title="Daily Logs" :value="100" :icon="LogIcon" />
      </div>
    </div>
  </MainLayout>
</template>
