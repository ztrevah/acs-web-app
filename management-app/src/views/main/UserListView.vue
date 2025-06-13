<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

import Dialog from 'primevue/dialog'

import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MainLayout from '@/layouts/MainLayout.vue'

import usersApi from '@/api/users'
import { ProgressSpinner } from 'primevue'

const crumbItems = [
  {
    name: 'User Management',
    link: '/rooms',
  },
]

const currentPendingUsers = ref([])
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

const searchPendingUsers = async () => {
  currentPendingUsers.value = []
  cursorList.value = [null]
  currentPageIndex.value = -1
  await handleNextPage()
}

const handleNextPage = async () => {
  if (!hasNextPage.value) return

  currentPageIndex.value += 1
  await fetchPendingUsers()
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  currentPageIndex.value -= 1
  await fetchPendingUsers()
}

const fetchPendingUsers = async () => {
  try {
    isFetching.value = true
    const params = {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
    }
    const response = await usersApi.getPendingUsers(params)
    const { cursorId: nextId, count, data } = response.data
    currentPendingUsers.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    console.log(err)
    cursorList.value = [null]
    currentPageIndex.value = 0
    currentPendingUsers.value = []
  } finally {
    isFetching.value = false
  }
}

const processedPendingUser = reactive({
  id: null,
  username: null,
  email: null,
})
const isProcessingPendingUser = ref(false)

const isDenyModalOpen = ref(false)
const onOpenDenyModal = (user) => {
  processedPendingUser.id = user.id
  processedPendingUser.username = user.username
  processedPendingUser.email = user.email
  isDenyModalOpen.value = true
}

const onCloseDenyModal = () => {
  isDenyModalOpen.value = false
}

const updateDenyModalVisible = (visible) => {
  if (!visible) onCloseDenyModal()
}

const denyPendingUser = async () => {
  if (!processedPendingUser.id) return

  try {
    isProcessingPendingUser.value = true
    const response = await usersApi.denyPendingUser(processedPendingUser.id)
    onCloseDenyModal()
    await searchPendingUsers()
  } catch (err) {
    onCloseDenyModal()
    console.log(err)
  } finally {
    isProcessingPendingUser.value = false
  }
}

const isApproveModalOpen = ref(false)
const onOpenApproveModal = (user) => {
  processedPendingUser.id = user.id
  processedPendingUser.username = user.username
  processedPendingUser.email = user.email
  isApproveModalOpen.value = true
}

const onCloseApproveModal = () => {
  isApproveModalOpen.value = false
}

const updateApproveModalVisible = (visible) => {
  if (!visible) onCloseApproveModal()
}

const approvePendingUser = async () => {
  if (!processedPendingUser.id) return

  try {
    isProcessingPendingUser.value = true
    const response = await usersApi.approvePendingUser(processedPendingUser)
    onCloseApproveModal()
    await searchPendingUsers()
  } catch (err) {
    onCloseApproveModal()
    console.log(err)
  } finally {
    isProcessingPendingUser.value = false
  }
}

onMounted(async () => {
  await searchPendingUsers()
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
          @submit.prevent="searchPendingUsers"
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
              v-if="!isFetching && currentPendingUsers.length === 0"
              class="text-center py-4 text-gray-600 text-lg"
            >
              No pending users found.
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
                      Username
                    </th>
                    <th
                      class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
                    ></th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in currentPendingUsers" :key="user.id" class="hover:bg-gray-50">
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                    >
                      <RouterLink :to="`/users/${user.id}`">{{ user.username }}</RouterLink>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ user.email }}
                    </td>
                    <td class="text-right px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        type="button"
                        class="p-2 rounded-md text-xs font-medium transition-all duration-200 ease-in-out border border-gray-400 text-gray-700 hover:bg-red-500 hover:text-white hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
                        @click="() => onOpenDenyModal(user)"
                      >
                        Deny
                      </button>
                      <button
                        type="button"
                        class="p-2 border border-transparent rounded-md text-xs font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        @click="() => onOpenApproveModal(user)"
                      >
                        Approve
                      </button>
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
        :visible="isDenyModalOpen"
        modal
        header="Disapprove pending user"
        class="w-full max-w-[350px]"
        v-on:update:visible="updateDenyModalVisible"
      >
        <template #header>
          <div class="inline-flex items-center justify-center gap-2">
            <span class="font-bold whitespace-nowrap text-lg">Disapprove pending user</span>
          </div>
        </template>
        <p class="text-gray-600 text-center mb-4">
          Are you sure you want to disapprove the user
          <span class="font-semibold">{{ processedPendingUser.username }}</span
          >?
        </p>
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2 text-xs border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-200 ease-in-out"
            @click="onCloseDenyModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2 text-xs bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
            @click="denyPendingUser"
          >
            Deny
          </button>
        </div>
      </Dialog>

      <Dialog
        :visible="isApproveModalOpen"
        modal
        header="Approve pending user"
        class="w-full max-w-[350px]"
        v-on:update:visible="updateApproveModalVisible"
      >
        <template #header>
          <div class="inline-flex items-center justify-center gap-2">
            <span class="font-bold whitespace-nowrap text-lg">Approve pending user</span>
          </div>
        </template>
        <p class="text-gray-600 text-center mb-4">
          Are you sure you want to approve the user
          <span class="font-semibold">{{ processedPendingUser.username }}</span
          >?
        </p>
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2 text-xs border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-200 ease-in-out"
            @click="onCloseApproveModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2 text-xs bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
            @click="approvePendingUser"
          >
            Approve
          </button>
        </div>
      </Dialog>
    </div>
  </MainLayout>
</template>
