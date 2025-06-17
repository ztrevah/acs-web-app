<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'

import MainLayout from '@/layouts/MainLayout.vue'
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import RoomDevices from '@/components/main/room-detail/RoomDevices.vue'
import RoomLogs from '@/components/main/room-detail/RoomLogs.vue'
import RoomMembers from '@/components/main/room-detail/RoomMembers.vue'

import roomsApi from '@/api/rooms'

const route = useRoute()
const router = useRouter()

const roomId = computed(() => route.params.id)
const crumbItems = [
  {
    name: 'Rooms',
    link: '/rooms',
  },
  {
    name: roomId.value,
    link: `/rooms/${roomId.value}`,
  },
]

const roomInfo = reactive({
  name: '',
  location: '',
})
const editingRoomInfo = reactive({
  name: '',
  location: '',
})

const getRoomInfo = async () => {
  try {
    const response = await roomsApi.getRoomById(roomId.value)
    roomInfo.name = response.data.name
    roomInfo.location = response.data.location
  } catch (err) {
    console.log(err)
    router.push({ path: '/rooms', replace: true })
  }
}

const isUpdating = ref(false)
const isEnableUpdating = ref(false)

const updateRoomInfo = async () => {
  if (editingRoomInfo.name === roomInfo.name && editingRoomInfo.location === roomInfo.location)
    return

  try {
    isUpdating.value = true
    const response = await roomsApi.updateRoom(roomId.value, editingRoomInfo)
    roomInfo.name = response.data.name
    roomInfo.location = response.data.location
    isEnableUpdating.value = false
  } catch (err) {
    console.log(err)
  } finally {
    isUpdating.value = false
  }
}

const enableUpdate = () => {
  editingRoomInfo.name = roomInfo.name
  editingRoomInfo.location = roomInfo.location
  isEnableUpdating.value = true
}

const roomNavBarItems = [
  {
    name: 'Logs',
  },
  {
    name: 'Members',
  },
  {
    name: 'Devices',
  },
]

const currentTabIndex = ref(0)
const switchTab = (tabIndex) => {
  currentTabIndex.value = tabIndex
}

onMounted(async () => {
  await getRoomInfo()
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="max-w-[200px] p-4">
        <div v-if="isEnableUpdating" class="space-y-4 w-max">
          <div>
            <label htmlFor="roomName" class="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="roomName"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              v-model="editingRoomInfo.name"
              :disabled="isUpdating"
            />
          </div>
          <div>
            <label htmlFor="roomLocation" class="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="roomLocation"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              v-model="editingRoomInfo.location"
              :disabled="isUpdating"
            />
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              @click="() => (isEnableUpdating = false)"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdating"
            >
              Cancel
            </button>
            <button
              @click="updateRoomInfo"
              class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdating"
            >
              Save Changes
            </button>
          </div>
        </div>
        <div v-else class="space-y-4 w-max">
          <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-baseline">
            <p class="text-md font-semibold text-gray-700">Name:</p>
            <p class="text-sm text-gray-900">{{ roomInfo.name }}</p>

            <p class="text-md font-semibold text-gray-700">Location:</p>
            <p class="text-sm text-gray-900">{{ roomInfo.location }}</p>
          </div>
          <div class="pt-2">
            <button
              @click="enableUpdate"
              class="w-full px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <nav class="w-full bg-white border-b border-gray-200">
        <ul class="flex justify-start items-center px-4">
          <li v-for="(item, index) in roomNavBarItems" class="mr-8">
            <a
              @click="() => switchTab(index)"
              :class="`
                  block py-2 text-lg font-medium transition-all duration-50 ease-in-out
                  ${
                    index === currentTabIndex
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-700 hover:text-indigo-500'
                  }
                `"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
      </nav>

      <RoomLogs v-if="currentTabIndex === 0" />
      <RoomMembers v-if="currentTabIndex === 1" />
      <RoomDevices v-if="currentTabIndex === 2" />
    </div>
  </MainLayout>
</template>
