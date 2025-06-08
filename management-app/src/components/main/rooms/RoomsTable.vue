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
      className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg"
    >
      <ProgressSpinner
        style="width: 40px; height: 40px"
        strokeWidth="4"
        fill="transparent"
        animationDuration=".5s"
      />
    </div>
    <div v-if="!isLoading && rooms.length === 0" className="text-center py-4 text-gray-600 text-lg">
      No rooms found.
    </div>
    <div
      v-else
      :className="`overflow-x-auto rounded-lg border border-gray-200 ${isLoading ? 'filter blur-sm' : ''} transition-filter duration-300`"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg"
            >
              ID
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg"
            >
              Location
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr v-for="room in rooms" :key="room.id" className="hover:bg-gray-50">
            <td
              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
            >
              <RouterLink :to="`rooms/${room.id}`">{{ room.id }}</RouterLink>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ room.name }}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ room.location }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
