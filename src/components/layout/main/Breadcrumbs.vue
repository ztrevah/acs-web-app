<script setup>
import { computed } from 'vue'

const props = defineProps({
  crumbs: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every(
        (crumb) =>
          typeof crumb === 'object' &&
          typeof crumb.name === 'string' &&
          (crumb.link === null || typeof crumb.link === 'string') &&
          (crumb.class === undefined || typeof crumb.class === 'string'),
      )
    },
  },

  separator: {
    type: String,
    default: '/', // Can be '/', '>', etc.
  },
})

const displayedCrumbs = computed(() => {
  const { crumbs } = props

  const firstItemsToDisplay = 2
  const lastItemsToDisplay = 2
  const maxItems = 5

  if (crumbs.length <= maxItems) {
    return crumbs
  }

  const firstPart = crumbs.slice(0, firstItemsToDisplay)
  const lastPart = crumbs.slice(crumbs.length - lastItemsToDisplay)

  const ellipsis = {
    name: '...',
    isEllipsis: true,
    link: null,
    class: 'pointer-events-none text-gray-500',
  }

  return [...firstPart, ellipsis, ...lastPart]
})

const handleClick = (crumb) => {
  if (crumb.link && !crumb.isEllipsis) {
    window.location.href = crumb.link // Using window.location.href for direct navigation
  }
}

const isLastCrumb = (crumb, index) => {
  return index === displayedCrumbs.value.length - 1
}
</script>

<template>
  <nav class="flex mb-4" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-2 sm:space-x-3">
      <li v-for="(crumb, index) in displayedCrumbs" :key="index" class="inline-flex items-center">
        <div class="flex items-center">
          <span v-if="index > 0" class="text-gray-400 mx-1 sm:mx-2">
            {{ separator }}
          </span>

          <a
            v-if="crumb.link && !crumb.isEllipsis"
            :href="crumb.link"
            @click.prevent="handleClick(crumb)"
            :class="[
              'text-xl font-medium text-gray-800 hover:text-blue-700',
              'transition ease-in-out duration-150',
              'inline-flex items-center rounded-md px-2 py-1',
              crumb.class, // Custom classes from prop
            ]"
            aria-current="page"
          >
            {{ crumb.name }}
          </a>
          <span
            v-else
            :class="[
              'text-sm font-medium text-gray-800',
              'inline-flex items-center rounded-md px-2 py-1',
              { 'cursor-default': crumb.isEllipsis },
              crumb.class,
            ]"
            aria-current="page"
          >
            {{ crumb.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>
