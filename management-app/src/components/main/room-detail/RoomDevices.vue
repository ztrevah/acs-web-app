<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Dialog, ProgressSpinner, Toast, useToast } from 'primevue'

import roomsApi from '@/api/rooms'

const route = useRoute()
const toast = useToast()

const roomId = route.params.id

const currentDeviceList = ref([])
const cursorList = ref([null])
const currentPageIndex = ref(-1)
const isFetching = ref(false)

const query = reactive({
  keyword: null,
})

const limit = 20

const hasNextPage = computed(() => {
  return currentPageIndex.value == -1 || cursorList.value[currentPageIndex.value + 1] !== null
})

const hasPrevPage = computed(() => {
  return currentPageIndex.value > 0
})

const handleNextPage = async () => {
  if (!hasNextPage.value) return

  currentPageIndex.value += 1
  await fetchDevices()
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  currentPageIndex.value -= 1
  await fetchDevices()
}

const fetchDevices = async () => {
  console.log(query)
  try {
    isFetching.value = true
    const response = await roomsApi.getRoomDevices(roomId, {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
    })

    const { cursorId: nextId, count, data } = response.data
    currentDeviceList.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    currentDeviceList.value = []
    currentPageIndex.value = -1
    cursorList.value = [null]
    console.log(err)
  } finally {
    isFetching.value = false
  }
}

const searchDevices = async () => {
  currentDeviceList.value = []
  currentPageIndex.value = -1
  cursorList.value = [null]
  await handleNextPage()
}

const isAddModalOpen = ref(false)
const addedDevice = reactive({
  deviceId: null,
})
const isAddingMember = ref(false)
const errorMessage = ref('')

const onOpenAddModal = () => {
  addedDevice.deviceId = null
  isAddModalOpen.value = true
}

const onCloseAddModal = () => {
  isAddModalOpen.value = false
  errorMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) onOpenAddModal()
  else onCloseAddModal()
}

const addDevice = async () => {
  if (!addedDevice.deviceId) return
  try {
    isAddingMember.value = true
    const response = await roomsApi.addRoomDevices(roomId, addedDevice)
    toast.add({
      severity: 'success',
      summary: 'New device added!',
      group: 'ard',
      life: 3000,
    })
    onCloseAddModal()
    await searchDevices()
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message ?? 'Error'
    console.log(err)
  } finally {
    isAddingMember.value = false
  }
}

onMounted(async () => {
  await searchDevices()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form
        class="relative flex items-center max-w-[300px] lg:w-[300px]"
        @submit.prevent="searchDevices"
      >
        <i
          class="pi pi-search absolute left-3 text-gray-400 hover:text-gray-700 cursor-pointer"
        ></i>
        <input
          type="text"
          placeholder="Search by keyword"
          class="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
          v-model="query.keyword"
        />
      </form>
      <button
        class="w-max bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        @click="onOpenAddModal"
      >
        <i class="pi pi-plus" style="size: 16px"></i>
        <span>Add</span>
      </button>
    </div>
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
      <div class="relative">
        <div
          v-if="isFetching"
          class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg"
        >
          <ProgressSpinner
            style="width: 40px; height: 40px"
            strokeWidth="4"
            fill="transparent"
            animationDuration=".5s"
          />
        </div>
        <div
          v-if="!isFetching && currentDeviceList.length === 0"
          class="text-center py-4 text-gray-600 text-lg"
        >
          No devices found.
        </div>
        <div
          v-else
          :class="`overflow-x-auto rounded-lg border border-gray-200 ${isFetching ? 'filter blur-sm' : ''} transition-filter duration-300`"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
                >
                  ID
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
                ></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="device in currentDeviceList"
                :key="device.id"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-900 cursor-pointer"
                >
                  <RouterLink :to="`/members/${device.id}`">{{ device.id }}</RouterLink>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <i class="pi pi-trash" style="font-size: 16px; color: red"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-between items-center mt-6">
        <button
          @click="handlePrevPage"
          :disabled="!hasPrevPage || isFetching"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          Previous
        </button>
        <button
          @click="handleNextPage"
          :disabled="!hasNextPage || isFetching"
          class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          Next
        </button>
      </div>
    </div>
  </div>
  <Dialog
    :visible="isAddModalOpen"
    modal
    header="Add device"
    class="w-full max-w-[300px]"
    v-on:update:visible="updateAddModalVisible"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap text-lg">Add new device</span>
      </div>
    </template>

    <form @submit.prevent="addDevice">
      <div class="flex flex-col gap-2 mb-4">
        <label for="id" class="text-md font-semibold hidden">ID</label>
        <input
          id="id"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          autocomplete="off"
          placeholder="Device ID"
          v-model="addedDevice.deviceId"
        />
      </div>
      <p v-if="errorMessage.length > 0" class="text-red-500 text-xs font-semibold my-1 text-center">
        {{ errorMessage }}
      </p>
      <button
        type="button"
        class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="addDevice"
        :disabled="isAddingMember"
      >
        Add
      </button>
    </form>
  </Dialog>
  <Toast position="top-right" group="ard" style="width: max-content">
    <template #message="slotProps">
      <div class="flex items-center gap-x-2 mr-2">
        <p class="font-medium text-sm">
          Device {{ addedDevice.deviceId }} has been registered to the room!
        </p>
      </div>
    </template>
  </Toast>
</template>
