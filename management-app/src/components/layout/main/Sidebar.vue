<script setup>
import { onMounted, ref } from 'vue'
import SidebarMenuItem from '@/components/layout/main/SidebarMenuItem.vue'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import RoomIcon from '@/components/icons/RoomIcon.vue'
import DeviceIcon from '@/components/icons/DeviceIcon.vue'
import MembersIcon from '@/components/icons/MembersIcon.vue'
import LogIcon from '@/components/icons/LogIcon.vue'
import AccountIcon from '@/components/icons/AccountIcon.vue'
import { useAuth } from '@/composables/useAuth'

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
  {
    name: 'Logs',
    icon: LogIcon,
    path: '/logs',
  },
]

const superAdminMenuItems = menuItems.concat([
  {
    name: 'Users',
    icon: AccountIcon,
    path: '/users-management',
  },
])

const hasUserOptions = ref(false)
const props = defineProps({
  isExpanded: {
    type: Boolean,
    default: true,
  },
})

onMounted(() => {
  const { getUserInfoFromAccessToken } = useAuth()
  const userInfo = getUserInfoFromAccessToken()

  if (userInfo) hasUserOptions.value = userInfo.role == 'SuperAdmin'
})
</script>

<template>
  <aside
    :class="[
      'bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out overflow-x-auto',
      isExpanded ? 'w-64' : 'w-20',
    ]"
  >
    <div class="p-4 flex items-center justify-center h-20">
      <img src="/src/assets/images/logo.png" alt="App Logo" class="h-10 w-auto" v-if="isExpanded" />
    </div>

    <nav class="flex-1 mt-4">
      <ul v-if="hasUserOptions">
        <SidebarMenuItem
          v-for="item in superAdminMenuItems"
          :key="item.name"
          :item="item"
          :isExpanded="isExpanded"
          :class="`mb-2`"
        />
      </ul>
      <ul v-else>
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
