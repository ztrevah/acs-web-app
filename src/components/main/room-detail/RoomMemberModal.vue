<script setup>
import roomsApi from '@/api/rooms'
import { AccessStatus, getAccessStatusTextColor } from '@/utils/access-status-utils'
import { convertUtcIsoDateTimeToLocal } from '@/utils/datetimeutils'
import { Dialog, ProgressSpinner } from 'primevue'
import { reactive, ref, watchEffect } from 'vue'

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['handleClose'])

const roomMemberInfo = reactive({
  roomId: props.roomId,
  memberId: props.memberId,
  status: AccessStatus.UNKNOWN,
  accessRights: [],
})

const updatingMemberRight = reactive({
  id: null,
  startTime: null,
  endTime: null,
  disabledStartTime: null,
  disabledEndTime: null,
})

const isFetching = ref(false)

const getRoomMemberInfo = async () => {
  if (!props.roomId || !props.memberId || !props.isOpen) return
  try {
    isFetching.value = true
    const response = await roomsApi.getRoomMemberInfo(props.roomId, props.memberId)
    roomMemberInfo.roomId = props.roomId
    roomMemberInfo.memberId = props.memberId
    roomMemberInfo.accessRights =
      response.data.accessRights
        .map((r) => {
          return {
            ...r,
            startTime: convertUtcIsoDateTimeToLocal(r.startTime),
            endTime: convertUtcIsoDateTimeToLocal(r.endTime),
            disabledStartTime: convertUtcIsoDateTimeToLocal(r.disabledStartTime),
            disabledEndTime: convertUtcIsoDateTimeToLocal(r.disabledEndTime),
            enableUpdate: false,
          }
        })
        .toSorted((a, b) => {
          if (a.startTime > b.startTime) {
            return -1
          }
          if (a.startTime < b.startTime) {
            return 1
          }
          return 0
        }) ?? []
    roomMemberInfo.status = response.data.status ?? AccessStatus.UNKNOWN
  } catch (err) {
    emit('handleClose', null)
    console.log(err)
  } finally {
    isFetching.value = false
  }
}

const onOpen = async () => {
  await getRoomMemberInfo()
}

const onClose = () => {
  updatingMemberRight.id = null
  emit('handleClose', roomMemberInfo)
}

const updateVisible = (visible) => {
  if (visible) onOpen()
  else onClose()
}

const isAddModalOpen = ref(false)
const addedRoomMember = reactive({
  memberId: props.memberId,
  startTime: null,
  endTime: null,
  disabledStartTime: null,
  disabledEndTime: null,
})
const isAddingRoomMember = ref(false)
const addErrorMessage = ref('')

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
  addErrorMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) onOpenAddModal()
  else onCloseAddModal()
}

const addRoomMember = async () => {
  if (!addedRoomMember.memberId || !addedRoomMember.startTime || !addedRoomMember.endTime) {
    addErrorMessage.value = 'Fill out all required fields'
    return
  }

  try {
    isAddingRoomMember.value = true

    const response = await roomsApi.addRoomMemberRight(props.roomId, addedRoomMember.memberId, {
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
    onCloseAddModal()
    await getRoomMemberInfo()
  } catch (err) {
    addErrorMessage.value = err.response?.data?.error?.message ?? 'Error'
    console.log(err)
  } finally {
    isAddingRoomMember.value = false
  }
}

const updateErrorMessage = ref('')
const isModifyingRight = ref(false)

const enableUpdateMemberRight = (right) => {
  updatingMemberRight.id = right.id
  updatingMemberRight.startTime = right.startTime
  updatingMemberRight.endTime = right.endTime
  updatingMemberRight.disabledStartTime = right.disabledStartTime
  updatingMemberRight.disabledEndTime = right.disabledEndTime

  roomMemberInfo.accessRights.map((r) => {
    r.enableUpdate = updatingMemberRight.id === r.id
    return r
  })
}

const cancelUpdateMemberRight = () => {
  updatingMemberRight.id = null
  roomMemberInfo.accessRights.map((r) => {
    r.enableUpdate = updatingMemberRight.id === r.id
    return r
  })

  updateErrorMessage.value = ''
}

const updateMemberRight = async () => {
  if (!props.roomId || !props.memberId) return
  if (
    !updatingMemberRight ||
    !updatingMemberRight.id ||
    !updatingMemberRight.startTime ||
    !updatingMemberRight.endTime
  ) {
    updateErrorMessage.value = 'Fill out all required fields'
    return
  }

  try {
    isModifyingRight.value = true
    const response = await roomsApi.updateRoomMemberRight(
      updatingMemberRight.id,
      props.roomId,
      props.memberId,
      {
        id: updatingMemberRight.id,
        startTime: updatingMemberRight.startTime
          ? new Date(updatingMemberRight.startTime).toISOString()
          : null,
        endTime: updatingMemberRight.endTime
          ? new Date(updatingMemberRight.endTime).toISOString()
          : null,
        disabledStartTime: updatingMemberRight.disabledStartTime
          ? new Date(updatingMemberRight.disabledStartTime).toISOString()
          : null,
        disabledEndTime: updatingMemberRight.disabledEndTime
          ? new Date(updatingMemberRight.disabledEndTime).toISOString()
          : null,
      },
    )

    updateErrorMessage.value = ''
    updatingMemberRight.id = null
    await getRoomMemberInfo()
  } catch (err) {
    updateErrorMessage.value = err.response?.data?.error?.message ?? 'Error'
    console.log(err)
  } finally {
    isModifyingRight.value = false
  }
}

const deleteMemberRight = async (right) => {
  try {
    isModifyingRight.value = true
    const response = await roomsApi.removeRoomMemberRight(right.id, props.roomId, props.memberId)

    updateErrorMessage.value = ''
    await getRoomMemberInfo()
  } catch (err) {
    console.log(err)
  } finally {
    isModifyingRight.value = false
  }
}

watchEffect(async () => {
  await getRoomMemberInfo()
})
</script>

<template>
  <Dialog
    :visible="isOpen"
    modal
    header="Edit Profile"
    class="w-max max-w-[700px] max-h-2/3 overflow-auto"
    v-on:update:visible="updateVisible"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap text-lg">Room Member Info</span>
      </div>
    </template>

    <template v-if="isFetching">
      <ProgressSpinner
        style="width: 40px; height: 40px"
        strokeWidth="4"
        fill="transparent"
        animationDuration=".5s"
      />
    </template>

    <template v-else>
      <div class="flex gap-4 items-center mb-2">
        <span class="text-sm font-semibold text-gray-700">Member: </span>
        <RouterLink :to="`/members/${roomMemberInfo.memberId}`">
          <p class="text-sm text-gray-900 hover:text-indigo-600">{{ roomMemberInfo.memberId }}</p>
        </RouterLink>
      </div>

      <div class="flex gap-4 items-center mb-2">
        <span class="text-sm font-semibold text-gray-700">Status: </span>
        <span :class="`text-sm font-semibold ${getAccessStatusTextColor(roomMemberInfo.status)}`">{{
          roomMemberInfo.status
        }}</span>
      </div>

      <div class="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
        <span>Access Rights:</span>
        <button
          class="w-max p-2 border border-transparent rounded-md text-xs font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          :disabled="isFetching"
          @click.prevent="onOpenAddModal"
        >
          <i class="pi pi-plus" style="font-size: 16px"></i>
        </button>
      </div>
      <div class="w-max flex flex-col gap-3">
        <form
          v-for="right in roomMemberInfo.accessRights"
          class="w-full flex gap-6 items-center justify-between py-2 px-4 rounded-lg shadow-md border border-gray-200"
          @submit.prevent="updateMemberRight"
        >
          <div v-if="!right.enableUpdate" class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-2">
              <label :for="`startTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Access Start Time:</label
              >
              <input
                type="datetime-local"
                :id="`startTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                :value="right.startTime"
                readonly
              />
            </div>

            <div class="flex flex-col gap-2">
              <label :for="`endTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Access End Time:</label
              >
              <input
                type="datetime-local"
                :id="`endTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                :value="right.endTime"
                readonly
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                :for="`disabledStartTime-${right.id}`"
                class="text-md font-medium text-gray-500"
                >Disabled From:</label
              >
              <input
                type="datetime-local"
                :id="`disabledStartTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                :value="right.disabledStartTime"
                readonly
              />
            </div>

            <div class="flex flex-col gap-2">
              <label :for="`disabledEndTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Disabled To:</label
              >
              <input
                type="datetime-local"
                :id="`disabledEndTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                :value="right.disabledEndTime"
                readonly
              />
            </div>
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-2">
              <label :for="`startTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Access Start Time:
              </label>
              <input
                type="datetime-local"
                :id="`startTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                v-model="updatingMemberRight.startTime"
                required
              />
            </div>

            <div class="flex flex-col gap-2">
              <label :for="`endTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Access End Time:</label
              >
              <input
                type="datetime-local"
                :id="`endTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                v-model="updatingMemberRight.endTime"
                required
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                :for="`disabledStartTime-${right.id}`"
                class="text-md font-medium text-gray-500"
                >Disabled From:</label
              >
              <input
                type="datetime-local"
                :id="`disabledStartTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                v-model="updatingMemberRight.disabledStartTime"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label :for="`disabledEndTime-${right.id}`" class="text-md font-medium text-gray-500"
                >Disabled To:</label
              >
              <input
                type="datetime-local"
                :id="`disabledEndTime-${right.id}`"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
                v-model="updatingMemberRight.disabledEndTime"
              />
            </div>

            <p
              v-if="updateErrorMessage.length > 0"
              class="text-red-500 text-xs font-semibold my-1 text-center"
            >
              {{ updateErrorMessage }}
            </p>
          </div>

          <div v-if="!right.enableUpdate" class="flex flex-col items-center gap-4">
            <button
              class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="isFetching"
            >
              <i
                class="pi pi-pen-to-square"
                style="font-size: 16px"
                @click.prevent="() => enableUpdateMemberRight(right)"
              ></i>
            </button>
            <button
              class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              :disabled="isFetching"
            >
              <i
                class="pi pi-trash"
                style="font-size: 16px"
                @click.prevent="() => deleteMemberRight(right)"
              ></i>
            </button>
          </div>

          <div v-else class="flex flex-col items-center gap-4">
            <button
              class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              :disabled="isFetching"
            >
              <i
                class="pi pi-undo"
                style="font-size: 16px"
                @click.prevent="cancelUpdateMemberRight"
              ></i>
            </button>
            <button
              class="w-full p-2 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isFetching"
            >
              <i class="pi pi-check" style="font-size: 16px" @click.prevent="updateMemberRight"></i>
            </button>
          </div>
        </form>
      </div>
    </template>
  </Dialog>

  <Dialog
    :visible="isAddModalOpen"
    modal
    header="Edit Profile"
    class="w-full max-w-[300px]"
    v-on:update:visible="updateAddModalVisible"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap text-lg">Add new member's right</span>
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
          readonly
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

      <p
        v-if="addErrorMessage.length > 0"
        class="text-red-500 text-xs font-semibold my-1 text-center"
      >
        {{ addErrorMessage }}
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
</template>
