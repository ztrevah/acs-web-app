<script setup>
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import StatisticCard from '@/components/main/home/StatisticCard.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import RoomIcon from '@/components/icons/RoomIcon.vue'
import LogIcon from '@/components/icons/LogIcon.vue'
import DeviceIcon from '@/components/icons/DeviceIcon.vue'
import { onMounted, ref } from 'vue'
import dashboardApi from '@/api/dashboard'

const crumbItems = [
  {
    name: 'Homepage',
    link: '/',
  },
]

const totalRooms = ref(0)
const totalDevices = ref(0)
const totalDailyLogs = ref(0)

onMounted(async () => {
  try {
    const response = await dashboardApi.getDashboardInfo()
    totalRooms.value = response.data.totalRooms
    totalDevices.value = response.data.totalDevices
    totalDailyLogs.value = response.data.totalDailyLogs
  } catch (err) {
    console.log(err)
  }
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatisticCard title="Total Rooms" :value="totalRooms" :icon="RoomIcon" />

        <StatisticCard title="Total Devices" :value="totalDevices" :icon="DeviceIcon" />

        <StatisticCard title="Daily Logs" :value="totalDailyLogs" :icon="LogIcon" />
      </div>
    </div>
  </MainLayout>
</template>
