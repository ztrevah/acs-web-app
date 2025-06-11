<script setup>
import ProgressSpinner from 'primevue/progressspinner'
const headers = ['id', 'name', 'location']
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  rooms: {
    type: Array,
    default: [],
  },
})
</script>

<template>
  <div class="relative">
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg"
    >
      <ProgressSpinner
        style="width: 40px; height: 40px"
        strokeWidth="4"
        fill="transparent"
        animationDuration=".5s"
      />
    </div>
    <div v-if="!isLoading && rooms.length === 0" class="text-center py-4 text-gray-600 text-lg">
      No rooms found.
    </div>
    <div
      v-else
      :class="`overflow-x-auto rounded-lg border border-gray-200 ${isLoading ? 'filter blur-sm' : ''} transition-filter duration-300`"
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
              Location
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="room in rooms" :key="room.id" class="hover:bg-gray-50">
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
            >
              <RouterLink :to="`/rooms/${room.id}`">{{ room.id }}</RouterLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ room.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ room.location }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
