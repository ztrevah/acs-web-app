<script setup>
import Sidebar from '@/components/layout/main/Sidebar.vue'
import Header from '@/components/layout/main/Header.vue'
import { ref } from 'vue'

const isSidebarExpanded = ref(true)

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar :isExpanded="isSidebarExpanded" />

    <div class="flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
      <Header @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-y-auto mt-4 ml-4 bg-white">
        <slot />
      </main>
    </div>
  </div>
</template>
