<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MainLayout from '@/layouts/MainLayout.vue'

import devicesApi from '@/api/devices'
import { ProgressSpinner, Select } from 'primevue'

const route = useRoute()
const router = useRouter()

const crumbItems = [
  {
    name: 'Devices',
    link: '/devices',
  },
]

const toast = useToast()

const isAddDeviceModalOpen = ref(false)
const errorAddDeviceMessage = ref('')
const openAddDeviceModal = () => {
  newDevice.id = ''
  isAddDeviceModalOpen.value = true
}

const closeAddDeviceModal = () => {
  isAddDeviceModalOpen.value = false
  errorAddDeviceMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) openAddDeviceModal()
  else closeAddDeviceModal()
}

const newDevice = reactive({
  id: '',
  direction: null,
})

const directions = ['Entry', 'Exit']

const addNewDevice = async () => {
  if (!newDevice.id || !newDevice.direction) return
  try {
    const response = await devicesApi.addDevice({
      id: newDevice.id,
      in: newDevice.direction === 'Entry',
    })
    toast.add({
      severity: 'success',
      summary: 'New room created!',
      group: 'ad',
      life: 3000,
    })
    closeAddDeviceModal()
    await fetchDevices()
  } catch (err) {
    errorAddDeviceMessage.value = err?.response?.data?.error?.message ?? 'Error'
  }
}

const currentDeviceList = ref([])
const cursorList = ref([null])
const currentPageIndex = ref(-1)
const isFetching = ref(false)

const query = reactive({
  keyword: null,
  direction: null,
})

const limit = 20

const hasNextPage = computed(() => {
  return currentPageIndex.value == -1 || cursorList.value[currentPageIndex.value + 1] !== null
})

const hasPrevPage = computed(() => {
  return currentPageIndex.value > 0
})

const searchDevices = async () => {
  currentDeviceList.value = []
  cursorList.value = [null]
  currentPageIndex.value = -1
  await handleNextPage()
}

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
  try {
    isFetching.value = true
    const params = {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
      isIn: query.direction === 'Entry' ? true : query.direction === null ? null : false,
    }
    const response = await devicesApi.getDevices(params)
    const { cursorId: nextId, count, data } = response.data
    currentDeviceList.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    console.log(err)
    cursorList.value = [null]
    currentPageIndex.value = 0
    currentDeviceList.value = []
  } finally {
    isFetching.value = false
  }
}

onMounted(async () => {
  await searchDevices()
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
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

        <Select
          id="direction"
          v-model="query.direction"
          :options="directions"
          placeholder="Entry/Exit"
          :disabled="isFetching"
          class="w-[150px] mx-2"
          showClear
          @change="searchDevices"
        />

        <button
          class="w-max ml-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          @click="openAddDeviceModal"
        >
          <i class="pi pi-plus" style="size: 16px"></i>
          <span>Add</span>
        </button>
        <Dialog
          :visible="isAddDeviceModalOpen"
          modal
          header="Edit Profile"
          class="w-full max-w-[300px]"
          v-on:update:visible="updateAddModalVisible"
        >
          <template #header>
            <div class="inline-flex items-center justify-center gap-2">
              <span class="font-bold whitespace-nowrap text-lg">Add a new device</span>
            </div>
          </template>

          <form @submit.prevent="addNewDevice">
            <span class="text-surface-500 dark:text-surface-400 block mb-2"
              >Enter new device's information.</span
            >
            <div class="flex flex-col gap-2 mb-4">
              <label for="id" class="text-md font-semibold">ID:</label>
              <input
                id="id"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="Device ID"
                v-model="newDevice.id"
              />

              <label for="in" class="text-md font-semibold">Direction:</label>
              <Select
                id="in"
                v-model="newDevice.direction"
                :options="directions"
                placeholder="Entry/Exit"
                class="w-full"
              />
            </div>
            <p
              v-if="errorAddDeviceMessage.length > 0"
              class="text-red-500 text-xs font-semibold my-1 text-center"
            >
              {{ errorAddDeviceMessage }}
            </p>
            <div class="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                class="p-2 rounded-md text-xs font-medium transition-all duration-200 ease-in-out border border-gray-400 text-gray-700 hover:bg-red-500 hover:text-white hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="closeAddDeviceModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="p-2 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="addNewDevice"
              >
                Add
              </button>
            </div>
          </form>
        </Dialog>
        <Toast position="top-right" group="ad" style="width: max-content">
          <template #message="slotProps">
            <div class="flex items-center gap-x-2 mr-2">
              <p class="font-medium text-sm">Device "{{ newDevice.id }}" registered!</p>
            </div>
          </template>
        </Toast>
      </div>
      <div class="flex items-center justify-center p-4">
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
                      class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Room ID
                    </th>
                    <th
                      class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="device in currentDeviceList" :key="device.id" class="hover:bg-gray-50">
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                    >
                      <RouterLink :to="`/devices/${device.id}`">{{ device.id }}</RouterLink>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ device.roomId }}
                    </td>
                    <td
                      :class="`px-6 py-4 whitespace-nowrap text-sm font-medium ${device.in ? 'text-green-600' : 'text-red-600'}`"
                    >
                      {{ device.in ? 'Entry' : 'Exit' }}
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
    </div>
  </MainLayout>
</template>
