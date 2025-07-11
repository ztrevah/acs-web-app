<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MainLayout from '@/layouts/MainLayout.vue'

import membersApi from '@/api/members'
import { ProgressSpinner } from 'primevue'

const route = useRoute()
const router = useRouter()

const crumbItems = [
  {
    name: 'Members',
    link: '/members',
  },
]

const toast = useToast()

const isAddMemberModalOpen = ref(false)
const errorAddMemberMessage = ref('')
const openAddMemberModal = () => {
  newMember.id = null
  newMember.name = null
  newMember.dateOfBirth = null
  newMember.hometown = null
  newMember.image = null
  isAddMemberModalOpen.value = true
}

const closeAddMemberModal = () => {
  isAddMemberModalOpen.value = false
  errorAddMemberMessage.value = ''
}

const updateAddModalVisible = (visible) => {
  if (visible) openAddMemberModal()
  else closeAddMemberModal()
}

const newMember = reactive({
  id: null,
  name: null,
  dateOfBirth: null,
  hometown: null,
  image: null,
})

const addNewMember = async () => {
  if (!newMember.id || !newMember.name || !newMember.dateOfBirth || !newMember.hometown) return

  try {
    const formData = new FormData()
    formData.append('id', newMember.id)
    formData.append('name', newMember.name)
    formData.append('dateOfBirth', newMember.dateOfBirth)
    formData.append('hometown', newMember.hometown)
    formData.append('image', newMember.image)
    const response = await membersApi.addMember(formData)
    toast.add({
      severity: 'success',
      summary: 'New member created!',
      group: 'am',
      life: 3000,
    })
    closeAddMemberModal()
    await fetchMembers()
  } catch (err) {
    console.log(err)
    errorAddMemberMessage.value = err?.response?.data?.error?.message ?? 'Error'
  }
}

const currentMemberList = ref([])
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

const searchMembers = async () => {
  currentMemberList.value = []
  cursorList.value = [null]
  currentPageIndex.value = -1
  await handleNextPage()
}

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
  try {
    isFetching.value = true
    const params = {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
    }
    const response = await membersApi.getMembers(params)
    const { cursorId: nextId, count, data } = response.data
    currentMemberList.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    console.log(err)
    cursorList.value = [null]
    currentPageIndex.value = 0
    currentMemberList.value = []
  } finally {
    isFetching.value = false
  }
}

onMounted(async () => {
  await searchMembers()
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
        <button
          class="w-max bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          @click="openAddMemberModal"
        >
          <i class="pi pi-plus" style="size: 16px"></i>
          <span>Add</span>
        </button>
        <Dialog
          :visible="isAddMemberModalOpen"
          modal
          header="Edit Profile"
          class="w-full max-w-[300px]"
          v-on:update:visible="updateAddModalVisible"
        >
          <template #header>
            <div class="inline-flex items-center justify-center gap-2">
              <span class="font-bold whitespace-nowrap text-lg">Add new member</span>
            </div>
          </template>

          <form @submit.prevent="addNewMember">
            <span class="text-surface-500 dark:text-surface-400 block mb-2"
              >Enter new member's information.</span
            >
            <div class="flex flex-col gap-2 mb-4">
              <label for="id" class="text-md font-semibold">ID:</label>
              <input
                id="id"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="ID"
                v-model="newMember.id"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="name" class="text-md font-semibold">Name:</label>
              <input
                id="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="Name"
                v-model="newMember.name"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="dob" class="text-md font-semibold">Date of Birth:</label>
              <input
                id="dob"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="dob"
                v-model="newMember.dateOfBirth"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="hometown" class="text-md font-semibold">Hometown:</label>
              <input
                id="hometown"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                autocomplete="off"
                placeholder="Hometown"
                v-model="newMember.hometown"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="image" class="text-md font-semibold">Image:</label>
              <input
                id="image"
                type="file"
                accept=".png,.jpg,.jpeg"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autocomplete="off"
                @change="(e) => (newMember.image = e.target.files[0])"
              />
            </div>
            <p
              v-if="errorAddMemberMessage.length > 0"
              class="text-red-500 text-xs font-semibold my-1 text-center"
            >
              {{ errorAddMemberMessage }}
            </p>
            <div class="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                class="p-2 rounded-md text-xs font-medium transition-all duration-200 ease-in-out border border-gray-400 text-gray-700 hover:bg-red-500 hover:text-white hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="closeAddMemberModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="p-2 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="addNewMember"
              >
                Add
              </button>
            </div>
          </form>
        </Dialog>
        <Toast position="top-right" group="am" style="width: max-content">
          <template #message="slotProps">
            <div class="flex items-center gap-x-2 mr-2">
              <p class="font-medium text-sm">Member "{{ newMember.id }}" added to the system!</p>
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
                      Date of Birth
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="member in currentMemberList" :key="member.id" class="hover:bg-gray-50">
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                    >
                      <RouterLink :to="`/members/${member.id}`">{{ member.id }}</RouterLink>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ member.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ member.dateOfBirth }}
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
