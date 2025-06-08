<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import RoomsTable from '@/components/main/rooms/RoomsTable.vue'

import roomsApi from '@/api/rooms'

const crumbItems = [
  {
    name: 'Rooms',
    link: '/rooms',
  },
]

const toast = useToast()

const isAddRoomModalOpen = ref(false)
const errorAddRoomMessage = ref('')
const openAddRoomModal = () => {
  isAddRoomModalOpen.value = true
}

const closeAddRoomModal = () => {
  isAddRoomModalOpen.value = false
  newRoom.location = ''
  newRoom.name = ''
  errorAddRoomMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) openAddRoomModal()
  else closeAddRoomModal()
}

const newRoom = reactive({
  name: '',
  location: '',
})

const createdRoom = ref(null)
const addNewRoom = async () => {
  if (newRoom.name.length === 0 || newRoom.location.length === 0) return
  try {
    const response = await roomsApi.addRoom(newRoom)
    createdRoom.value = response.data
    toast.add({
      severity: 'success',
      summary: 'New room created!',
      group: 'ar',
      life: 3000,
    })
    closeAddRoomModal()
    await refetchRooms()
  } catch (err) {
    errorAddRoomMessage.value = err?.response?.data?.error?.message ?? 'Error'
  }
}

const currentRoomListings = ref([])
const cursorList = ref([null])
const currentPageIndex = ref(-1)
const isFetchingRooms = ref(false)
const searchRoomId = ref('')
const limit = 10

const hasNextPage = computed(() => {
  return currentPageIndex.value == -1 || cursorList.value[currentPageIndex.value + 1] !== null
})

const hasPrevPage = computed(() => {
  return currentPageIndex.value > 0
})

const getRoomById = async () => {
  if (searchRoomId.value.length === 0) {
    await refetchRooms()
    return
  }

  try {
    isFetchingRooms.value = true
    const response = await roomsApi.getRoomById(searchRoomId.value)
    currentRoomListings.value = [response.data]
  } catch (err) {
    currentRoomListings.value = []
  } finally {
    isFetchingRooms.value = false
    currentPageIndex.value = 0
    cursorList.value = [null, null]
  }
}

const handleNextPage = async () => {
  if (!hasNextPage.value) return

  try {
    isFetchingRooms.value = true
    const params = {
      cursorId: cursorList.value[currentPageIndex.value + 1],
      limit,
    }
    const response = await roomsApi.getRooms(params)
    const { cursorId: nextId, count, data } = response.data
    currentRoomListings.value = data
    cursorList.value = [...cursorList.value, nextId]
    currentPageIndex.value += 1
  } catch (err) {
    // Handle fetching error
  } finally {
    isFetchingRooms.value = false
  }
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  try {
    isFetchingRooms.value = true
    const params = {
      cursorId: cursorList[currentPageIndex.value - 1],
      limit,
    }
    const response = await roomsApi.getRooms(params)
    const { cursorId: nextId, count, data } = response.data
    currentRoomListings.value = data
    cursorList.value[currentPageIndex] = nextId
    cursorList.value.pop()
    currentPageIndex.value -= 1
  } catch (err) {
    // Handle fetching error
  } finally {
    isFetchingRooms.value = false
  }
}

const refetchRooms = async () => {
  currentPageIndex.value = -1
  cursorList.value = [null]
  await handleNextPage()
  return
}

onMounted(async () => {
  await refetchRooms()
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          class="relative flex items-center max-w-[300px] lg:w-[300px]"
          @submit.prevent="getRoomById"
        >
          <i
            class="pi pi-search absolute left-3 text-gray-400 hover:text-gray-700 cursor-pointer"
          ></i>
          <input
            type="text"
            placeholder="Search by ID"
            class="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
            v-model="searchRoomId"
          />
        </form>
        <button
          class="w-max bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          @click="openAddRoomModal"
        >
          <i class="pi pi-plus" style="size: 16px"></i>
          <span>Add</span>
        </button>
        <Dialog
          :visible="isAddRoomModalOpen"
          modal
          header="Edit Profile"
          class="w-full max-w-[300px]"
          v-on:update:visible="updateAddModalVisible"
        >
          <template #header>
            <div class="inline-flex items-center justify-center gap-2">
              <span class="font-bold whitespace-nowrap text-lg">Add a new room</span>
            </div>
          </template>

          <form @submit.prevent="addNewRoom">
            <span class="text-surface-500 dark:text-surface-400 block mb-2"
              >Enter new room's information.</span
            >
            <div class="flex flex-col gap-2 mb-4">
              <label for="name" class="text-md font-semibold">Name:</label>
              <input
                id="name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="Name"
                v-model="newRoom.name"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="location" class="text-md font-semibold">Location:</label>
              <input
                id="location"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="Location"
                v-model="newRoom.location"
              />
            </div>
            <p v-if="errorAddRoomMessage.length > 0" class="text-red-500 text-xs my-1 text-center">
              {{ errorAddRoomMessage }}
            </p>
            <div class="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                class="p-2 rounded-md text-xs font-medium transition-all duration-200 ease-in-out border border-gray-400 text-gray-700 hover:bg-red-500 hover:text-white hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="closeAddRoomModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="p-2 border border-transparent rounded-md text-xs font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                @click="addNewRoom"
              >
                Add
              </button>
            </div>
          </form>
        </Dialog>
        <Toast position="top-right" group="ar" style="width: max-content">
          <template #message="slotProps">
            <div class="flex items-center gap-x-2 mr-2">
              <p class="font-medium text-sm">Room "{{ createdRoom.name }}" created!</p>
            </div>
          </template>
        </Toast>
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
          <RoomsTable :is-loading="isFetchingRooms" :rooms="currentRoomListings" />
          <div className="flex justify-between items-center mt-6">
            <button
              @click="handlePrevPage"
              :disabled="!hasPrevPage || isFetchingRooms"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              Previous
            </button>
            <button
              @click="handleNextPage"
              :disabled="!hasNextPage || isFetchingRooms"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
