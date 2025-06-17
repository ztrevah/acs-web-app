<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (value) => 'name' in value && 'icon' in value && 'path' in value,
  },
  isExpanded: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()

const isActive = computed(() => {
  if (props.item.path === '/') return route.path === props.item.path

  return route.path.startsWith(props.item.path)
})
</script>

<template>
  <li>
    <router-link
      :to="item.path"
      :class="[
        'flex items-center py-3 px-6 text-white font-semibold hover:bg-indigo-700 transition-colors duration-200 ease-in-out group',
        isActive
          ? 'bg-indigo-700 bg-opacity-70 border-l-4 border-white'
          : 'border-l-4 border-transparent',
      ]"
    >
      <item.icon :width="24" :height="24" />
      <span
        v-if="isExpanded"
        class="whitespace-nowrap overflow-hidden transition-opacity duration-300 ease-in-out ml-2"
      >
        {{ item.name }}
      </span>
    </router-link>
  </li>
</template>
