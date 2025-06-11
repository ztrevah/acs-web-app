<script setup>
import { ref } from 'vue'

import HamburgerMenuIcon from '@/components/icons/HamburgerMenuIcon.vue'
import SettingIcon from '@/components/icons/SettingIcon.vue'
import NotificationIcon from '@/components/icons/NotificationIcon.vue'

import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const isHeaderMenuOpen = ref(false)
const toggleMenu = () => {
  isHeaderMenuOpen.value = !isHeaderMenuOpen.value
}

const { logout } = useAuth()
const handleLogout = async () => {
  try {
    await logout()
    router.go(0)
  } catch (err) {
    console.log(err)
  }
}
</script>

<template>
  <header class="bg-white h-20 flex items-center justify-between px-6 shadow-sm z-10 relative">
    <button @click="toggleSidebar" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
      <HamburgerMenuIcon :width="28" :height="28" />
    </button>

    <div class="flex items-center space-x-4">
      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <SettingIcon :width="28" :height="28" />
      </button>

      <button class="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
        <NotificationIcon :width="28" :height="28" />
      </button>

      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
        <img
          src="/src/assets/images/avatar_admin.jpg"
          alt="User Avatar"
          class="w-full h-full object-cover"
          @click="toggleMenu"
        />
        <div
          v-if="isHeaderMenuOpen"
          class="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 transform origin-top-right transition-all duration-200 ease-out animate-fade-in"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 truncate">
            <span class="text-gray-900">chiennq</span>
          </div>

          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
