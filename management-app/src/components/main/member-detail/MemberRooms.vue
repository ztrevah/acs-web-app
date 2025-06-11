<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import { ProgressSpinner } from 'primevue'

import membersApi from '@/api/members'

const route = useRoute()

const memberId = route.params.id

const currentAccessibleRoomList = ref([])
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
  await fetchAccessibleRooms()
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  currentPageIndex.value -= 1
  await fetchAccessibleRooms()
}

const fetchAccessibleRooms = async () => {
  console.log(query)
  try {
    isFetching.value = true
    const response = await membersApi.getAccessibleRoomsByMember(memberId, {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      keyword: query.keyword ? query.keyword : null,
    })

    const { cursorId: nextId, count, data } = response.data
    currentAccessibleRoomList.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    currentAccessibleRoomList.value = []
    currentPageIndex.value = -1
    cursorList.value = [null]
    console.log(err)
  } finally {
    isFetching.value = false
  }
}

const searchAccessibleRooms = async () => {
  currentAccessibleRoomList.value = []
  currentPageIndex.value = -1
  cursorList.value = [null]
  await handleNextPage()
}

onMounted(async () => {
  await searchAccessibleRooms()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form
        class="relative flex items-center max-w-[300px] lg:w-[300px]"
        @submit.prevent="searchAccessibleRooms"
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
          v-if="!isFetching && currentAccessibleRoomList.length === 0"
          class="text-center py-4 text-gray-600 text-lg"
        >
          No rooms found.
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
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
                >
                  Location
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="room in currentAccessibleRoomList"
                :key="room.id"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-900 cursor-pointer"
                >
                  <RouterLink :to="`/rooms/${room.id}`">{{ room.id }}</RouterLink>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ room.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ room.location }}
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
</template>
