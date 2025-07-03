<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'

import logsApi from '@/api/logs'
import imagesApi from '@/api/images'
import { convertUtcIsoDateTimeToLocal } from '@/utils/datetimeutils'

const route = useRoute()
const router = useRouter()

const logId = computed(() => route.params.id)
const crumbItems = [
  {
    name: 'Logs',
    link: '/logs',
  },
  {
    name: logId.value,
    link: `/logs/${logId.value}`,
  },
]

const logInfo = reactive({
  id: logId,
  createdAt: null,
  roomId: null,
  memberId: null,
  deviceId: null,
  imageUrl: null,
  in: null,
})

const logImage = reactive({
  src: '',
  alt: 'Log image',
})

const getLogInfo = async () => {
  try {
    const response = await logsApi.getLogById(logId.value)
    logInfo.createdAt = response.data.createdAt
    logInfo.roomId = response.data.roomId
    logInfo.memberId = response.data.civilianId
    logInfo.deviceId = response.data.deviceId
    logInfo.imageUrl = response.data.imageUrl
    logInfo.in = response.data.in

    if (logInfo.imageUrl) {
      try {
        const imageResponse = await imagesApi.getImage(logInfo.imageUrl)
        const imageBlob = imageResponse.data
        const objectUrl = URL.createObjectURL(imageBlob)
        logImage.src = objectUrl
      } catch (err) {
        logImage.alt = 'Log image not available.'
      }
    }
  } catch (err) {
    console.log(err)
    router.push({ path: '/logs', replace: true })
  }
}

onMounted(async () => {
  await getLogInfo()
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="p-4">
        <div class="space-y-4 w-full">
          <div class="flex flex-col gap-2">
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-baseline">
              <p class="text-md font-semibold text-gray-700">Access time:</p>
              <p class="text-sm text-gray-900">
                {{ convertUtcIsoDateTimeToLocal(logInfo.createdAt) }}
              </p>

              <p class="text-md font-semibold text-gray-700">Room ID:</p>
              <RouterLink :to="`/rooms/${logInfo.roomId}`">
                <p class="text-sm text-gray-900 hover:text-indigo-600">{{ logInfo.roomId }}</p>
              </RouterLink>

              <p class="text-md font-semibold text-gray-700">Member ID:</p>
              <RouterLink :to="`/members/${logInfo.memberId}`">
                <p class="text-sm text-gray-900 hover:text-indigo-600">{{ logInfo.memberId }}</p>
              </RouterLink>

              <p class="text-md font-semibold text-gray-700">Direction:</p>
              <p :class="`text-sm font-medium ${logInfo.in ? 'text-green-600' : 'text-red-600'}`">
                {{ logInfo.in ? 'Entry' : 'Exit' }}
              </p>

              <p class="text-md font-semibold text-gray-700">Device ID:</p>
              <RouterLink :to="`/devices/${logInfo.deviceId}`">
                <p class="text-sm text-gray-900 hover:text-indigo-600">{{ logInfo.deviceId }}</p>
              </RouterLink>
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-md font-semibold text-gray-700 mb-2">Log image:</p>
            <img
              id="myAuthImage"
              :src="logImage.src"
              :alt="logImage.alt"
              class="block w-[200px]"
              :onload="
                () => {
                  URL.revokeObjectURL(logImage.src)
                }
              "
            />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
