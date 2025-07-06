<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Checkbox, Dialog, ProgressSpinner, Toast, useToast } from 'primevue'

import roomsApi from '@/api/rooms'
import { getAccessStatusTextColor } from '@/utils/access-status-utils'
import RoomMemberModal from './RoomMemberModal.vue'

const route = useRoute()
const toast = useToast()

const roomId = route.params.id

const currentMemberList = ref([])
const cursorList = ref([null])
const currentPageIndex = ref(-1)
const isFetching = ref(false)

const query = reactive({
  keyword: null,
  onlyAllowed: false,
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
  await fetchMembers()
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  currentPageIndex.value -= 1
  await fetchMembers()
}

const fetchMembers = async () => {
  console.log(query)
  try {
    isFetching.value = true
    const response = await roomsApi.getRoomMembers(roomId, {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
      onlyAllowed: query.onlyAllowed,
    })

    const { cursorId: nextId, count, data } = response.data
    currentMemberList.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    currentMemberList.value = []
    currentPageIndex.value = -1
    cursorList.value = [null]
    console.log(err)
  } finally {
    isFetching.value = false
  }
}

const searchMembers = async () => {
  currentMemberList.value = []
  currentPageIndex.value = -1
  cursorList.value = [null]
  await handleNextPage()
}

const isAddModalOpen = ref(false)
const addedRoomMember = reactive({
  memberId: null,
  startTime: null,
  endTime: null,
  disabledStartTime: null,
  disabledEndTime: null,
})
const isAddingRoomMember = ref(false)
const errorMessage = ref('')

const onOpenAddModal = () => {
  isAddModalOpen.value = true
}

const onCloseAddModal = () => {
  isAddModalOpen.value = false
  addedRoomMember.memberId = null
  addedRoomMember.startTime = null
  addedRoomMember.endTime = null
  addedRoomMember.disabledStartTime = null
  addedRoomMember.disabledEndTime = null
  errorMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) onOpenAddModal()
  else onCloseAddModal()
}

const addRoomMember = async () => {
  if (!addedRoomMember.memberId || !addedRoomMember.startTime || !addedRoomMember.endTime) {
    errorMessage.value = 'Fill out all required fields'
    return
  }

  try {
    isAddingRoomMember.value = true

    const response = await roomsApi.addRoomMemberRight(roomId, addedRoomMember.memberId, {
      memberId: addedRoomMember.memberId,
      startTime: addedRoomMember.startTime
        ? new Date(addedRoomMember.startTime).toISOString()
        : null,
      endTime: addedRoomMember.endTime ? new Date(addedRoomMember.endTime).toISOString() : null,
      disabledStartTime: addedRoomMember.disabledStartTime
        ? new Date(addedRoomMember.disabledStartTime).toISOString()
        : null,
      disabledEndTime: addedRoomMember.disabledEndTime
        ? new Date(addedRoomMember.disabledEndTime).toISOString()
        : null,
    })
    toast.add({
      severity: 'success',
      summary: 'New room member added!',
      group: 'arm',
      life: 3000,
    })
    onCloseAddModal()
    await searchMembers()
  } catch (err) {
    errorMessage.value = err.response?.data?.error?.message ?? 'Error'
    console.log(err)
  } finally {
    isAddingRoomMember.value = false
  }
}

const isRoomMemberInfoModalOpen = ref(false)
const reviewedMember = ref(null)
const onOpenRoomMemberModal = (member) => {
  reviewedMember.value = member
  isRoomMemberInfoModalOpen.value = true
}

const onCloseRoomMemberModal = async (newInfo) => {
  isRoomMemberInfoModalOpen.value = false
  if (!newInfo) {
    await searchMembers()
  }
  reviewedMember.value.status = newInfo.status
}

const isDeleteMemberModalOpen = ref(false)
const deletedMember = reactive({
  memberId: null,
})
const isDeletingMember = ref(false)

const onClickDeleteMember = (memberId) => {
  deletedMember.memberId = memberId
  isDeleteMemberModalOpen.value = true
}

const onCloseDeleteModal = () => {
  isDeleteMemberModalOpen.value = false
  errorMessage.value = ''
}

const updateRemoveModalVisible = (visible) => {
  if (!visible) onCloseDeleteModal()
}

const removeMember = async () => {
  if (!deletedMember.memberId) return
  try {
    isDeletingMember.value = true
    const response = await roomsApi.removeAllRoomMemberRights(roomId, deletedMember.memberId)
    onCloseDeleteModal()
    await searchMembers()
  } catch (err) {
    onCloseDeleteModal()
    console.log(err)
  } finally {
    isDeletingMember.value = false
  }
}

onMounted(async () => {
  await searchMembers()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      <div class="flex flex-col gap-3">
        <form
          class="relative flex items-center max-w-[300px] lg:w-[300px]"
          @submit.prevent="searchMembers"
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

        <div class="flex items-center gap-2">
          <Checkbox
            v-model="query.onlyAllowed"
            binary
            variant="outlined"
            inputId="onlyAllowed"
            :disabled="isFetching"
            @change="searchMembers"
          />
          <label for="onlyAllowed"> Show allowed only </label>
        </div>
      </div>

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
          v-if="!isFetching && currentMemberList.length === 0"
          class="text-center py-4 text-gray-600 text-lg"
        >
          No members found.
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
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
                ></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="roomMember in currentMemberList"
                :key="roomMember.id"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-900 cursor-pointer"
                >
                  <RouterLink :to="`/members/${roomMember.id}`">{{ roomMember.id }}</RouterLink>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ roomMember.name }}
                </td>
                <td
                  :class="`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getAccessStatusTextColor(roomMember.status)}`"
                >
                  {{ roomMember.status }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <i
                    class="pi pi-info-circle mr-2"
                    style="font-size: 16px; color: gray"
                    @click="
                      () => {
                        onOpenRoomMemberModal(roomMember)
                      }
                    "
                  ></i>

                  <i
                    class="pi pi-trash"
                    style="font-size: 16px; color: red"
                    @click="
                      () => {
                        onClickDeleteMember(roomMember.id)
                      }
                    "
                  ></i>
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
    header="Edit Profile"
    class="w-full max-w-[300px]"
    v-on:update:visible="updateAddModalVisible"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap text-lg">Add new room member</span>
      </div>
    </template>

    <form @submit.prevent="addRoomMember">
      <div class="flex flex-col gap-2 mb-4">
        <label for="id" class="text-md font-medium text-gray-500">Member ID</label>
        <input
          id="id"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          autocomplete="off"
          placeholder="Member ID"
          v-model="addedRoomMember.memberId"
        />
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label for="startTime" class="text-md font-medium text-gray-500">Access Start Time:</label>
        <input
          type="datetime-local"
          id="startTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="addedRoomMember.startTime"
          required
        />
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label for="endTime" class="text-md font-medium text-gray-500">Access End Time:</label>
        <input
          type="datetime-local"
          id="endTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="addedRoomMember.endTime"
          required
        />
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label for="disabledStartTime" class="text-md font-medium text-gray-500"
          >Disabled From:</label
        >
        <input
          type="datetime-local"
          id="disabledStartTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="addedRoomMember.disabledStartTime"
        />
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label for="disabledEndTime" class="text-md font-medium text-gray-500">Disabled To:</label>
        <input
          type="datetime-local"
          id="disabledEndTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="addedRoomMember.disabledEndTime"
        />
      </div>

      <p v-if="errorMessage.length > 0" class="text-red-500 text-xs font-semibold my-1 text-center">
        {{ errorMessage }}
      </p>
      <button
        type="button"
        class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="addRoomMember"
        :disabled="isAddingRoomMember"
      >
        Add
      </button>
    </form>
  </Dialog>
  <Toast position="top-right" group="arm" style="width: max-content">
    <template #message="slotProps">
      <div class="flex items-center gap-x-2 mr-2">
        <p class="font-medium text-sm">
          New access right of member {{ addedRoomMember.memberId }} created!
        </p>
      </div>
    </template>
  </Toast>

  <RoomMemberModal
    v-if="reviewedMember"
    :roomId="roomId"
    :memberId="reviewedMember.id"
    :isOpen="isRoomMemberInfoModalOpen"
    @handleClose="onCloseRoomMemberModal"
  />

  <Dialog
    :visible="isDeleteMemberModalOpen"
    modal
    header="Remove Access Right"
    class="w-full max-w-[300px]"
    v-on:update:visible="updateRemoveModalVisible"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap text-lg">Remove Access Right</span>
      </div>
    </template>
    <p class="text-gray-600 text-center mb-4">
      Are you sure you want to remove all access rights of member
      <span class="font-semibold">{{ deletedMember.memberId }}</span
      >?
    </p>
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="w-full sm:w-auto px-5 py-2 text-xs border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-200 ease-in-out"
        @click="onCloseDeleteModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="w-full sm:w-auto px-5 py-2 text-xs bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
        @click="removeMember"
      >
        Remove
      </button>
    </div>
  </Dialog>
</template>
