<script setup>
const props = defineProps({
  width: {
    type: Number,
    default: 16,
  },
  height: {
    type: Number,
    default: 16,
  },
  fillColor: {
    type: String,
    default: 'currentColor',
  },
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 16 16">
    <path
      :fill="fillColor"
      d="M10 7.998a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M7.598 2.01A.5.5 0 0 0 7 2.5v10.997a.5.5 0 0 0 .598.49l5-1a.5.5 0 0 0 .402-.49V3.5a.5.5 0 0 0-.402-.49zM8 12.887V3.11l4 .8v8.177zm-2 .11v-1H4V4h2V3H3.5a.5.5 0 0 0-.5.5v8.997a.5.5 0 0 0 .5.5z"
    />
  </svg>
</template>
