<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  icon: [Object, Function],
})
</script>

<template>
  <div class="bg-indigo-700 rounded-lg shadow-lg p-6 flex items-center space-x-6 justify-between">
    <div class="flex-shrink-0 bg-indigo-600 p-3 rounded-full">
      <icon :width="60" :height="60" :fillColor="`#FFFFFF`" />
    </div>
    <div class="flex flex-col items-end">
      <div class="text-white text-4xl font-bold text-right">{{ value }}</div>
      <div class="text-indigo-200 text-lg text-right">{{ title }}</div>
    </div>
  </div>
</template>
