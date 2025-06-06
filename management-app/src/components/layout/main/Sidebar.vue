<script setup>
import { ref } from 'vue'
import SidebarMenuItem from '@/components/layout/main/SidebarMenuItem.vue'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import RoomIcon from '@/components/icons/RoomIcon.vue'
import DeviceIcon from '@/components/icons/DeviceIcon.vue'
import MembersIcon from '@/components/icons/MembersIcon.vue'

const menuItems = [
  {
    name: 'Home',
    icon: HomeIcon,
    path: '/',
  },
  {
    name: 'Rooms',
    icon: RoomIcon,
    path: '/rooms',
  },
  {
    name: 'Devices',
    icon: DeviceIcon,
    path: '/devices',
  },
  {
    name: 'Members',
    icon: MembersIcon,
    path: '/members',
  },
]

const props = defineProps({
  isExpanded: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <aside
    :class="[
      'bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out',
      isExpanded ? 'w-64' : 'w-20',
    ]"
  >
    <div class="p-4 flex items-center justify-center h-20">
      <img src="/src/assets/images/logo.png" alt="App Logo" class="h-10 w-auto" v-if="isExpanded" />
    </div>

    <nav class="flex-1 mt-4">
      <ul>
        <SidebarMenuItem
          v-for="item in menuItems"
          :key="item.name"
          :item="item"
          :isExpanded="isExpanded"
          :class="`mb-2`"
        />
      </ul>
    </nav>
  </aside>
</template>
