<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import { ProgressSpinner } from 'primevue'

import logsApi from '@/api/logs'
import { convertUtcIsoDateTime } from '@/utils/datetimeutils'

const route = useRoute()
const memberId = route.params.id

const currentLogs = ref([])
const cursorList = ref([null])
const currentPageIndex = ref(-1)
const isFetching = ref(false)

const filter = reactive({
  fromTime: null,
  toTime: null,
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
  await fetchLogs()
}

const handlePrevPage = async () => {
  if (!hasPrevPage.value) return

  currentPageIndex.value -= 1
  await fetchLogs()
}

const fetchLogs = async () => {
  console.log(filter)
  try {
    isFetching.value = true
    const response = await logsApi.getLogsByMember(memberId, {
      cursorId: cursorList.value[currentPageIndex.value],
      limit,
      fromTime: filter.fromTime ? new Date(filter.fromTime).toISOString() : null,
      toTime: filter.toTime ? new Date(filter.toTime).toISOString() : null,
    })

    const { cursorId: nextId, count, data } = response.data
    currentLogs.value = data
    cursorList.value = cursorList.value.slice(0, currentPageIndex.value + 1).concat([nextId])
  } catch (err) {
    currentLogs.value = []
    currentPageIndex.value = -1
    cursorList.value = [null]
    console.log(err)
  } finally {
    isFetching.value = false
  }
}

const searchLogs = async () => {
  currentLogs.value = []
  currentPageIndex.value = -1
  cursorList.value = [null]
  await handleNextPage()
}

const clearFilter = () => {
  filter.fromTime = null
  filter.toTime = null
}

onMounted(async () => {
  await searchLogs()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <form class="w-full flex flex-col gap-4 mb-4" @submit.prevent="searchLogs">
      <div class="space-y-2 min-w-[200px] max-w-[400px]">
        <label for="fromTime">Start Date & Time:</label>
        <input
          type="datetime-local"
          id="fromTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="filter.fromTime"
        />
      </div>
      <div class="space-y-2 min-w-[200px] max-w-[400px]">
        <label for="toTime">End Date & Time:</label>
        <input
          type="datetime-local"
          id="toTime"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm"
          v-model="filter.toTime"
        />
      </div>
      <div class="flex items-center w-max gap-x-2">
        <button
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-sm"
          @click="clearFilter"
        >
          Clear
        </button>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-sm"
          @submit.prevent="searchLogs"
        >
          Filter
        </button>
      </div>
    </form>
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
          v-if="!isFetching && currentLogs.length === 0"
          class="text-center py-4 text-gray-600 text-lg"
        >
          No logs found.
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
                  Created At
                </th>
                <th
                  class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  Room ID
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="log in currentLogs" :key="log.id" class="hover:bg-gray-50 cursor-pointer">
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-900 cursor-pointer"
                >
                  <RouterLink :to="`/logs/${log.id}`">{{
                    convertUtcIsoDateTime(log.createdAt)
                  }}</RouterLink>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ log.roomId }}
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
