<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import Breadcrumbs from '@/components/layout/main/Breadcrumbs.vue'
import MemberLogs from '@/components/main/member-detail/MemberLogs.vue'
import MemberRooms from '@/components/main/member-detail/MemberRooms.vue'

import membersApi from '@/api/members'
import imagesApi from '@/api/images'

const route = useRoute()
const router = useRouter()

const memberId = computed(() => route.params.id)
const crumbItems = [
  {
    name: 'Members',
    link: '/members',
  },
  {
    name: memberId.value,
    link: `/members/${memberId.value}`,
  },
]

const memberInfo = reactive({
  id: memberId.value,
  name: null,
  dateOfBirth: null,
  hometown: null,
  imageUrl: null,
})
const editingMemberInfo = reactive({
  id: memberId.value,
  name: null,
  dateOfBirth: null,
  hometown: null,
  image: null,
})
const profileImageElement = reactive({
  src: null,
  alt: null,
})

const getMemberInfo = async () => {
  try {
    const response = await membersApi.getMemberById(memberId.value)
    memberInfo.id = response.data.id
    memberInfo.name = response.data.name
    memberInfo.dateOfBirth = response.data.dateOfBirth
    memberInfo.hometown = response.data.hometown
    memberInfo.imageUrl = response.data.imageUrl

    if (memberInfo.imageUrl) {
      const imageResponse = await imagesApi.getImage(memberInfo.imageUrl)
      const imageBlob = imageResponse.data
      const objectUrl = URL.createObjectURL(imageBlob)
      profileImageElement.src = objectUrl
    }
  } catch (err) {
    console.log(err)
    router.push({ path: '/members', replace: true })
  }
}

const isUpdating = ref(false)
const isEnableUpdating = ref(false)

const updateMemberInfo = async () => {
  if (!editingMemberInfo.name || !editingMemberInfo.dateOfBirth || !editingMemberInfo.hometown)
    return

  try {
    isUpdating.value = true
    const formData = new FormData()
    formData.append('id', editingMemberInfo.id)
    formData.append('name', editingMemberInfo.name)
    formData.append('dateOfBirth', editingMemberInfo.dateOfBirth)
    formData.append('hometown', editingMemberInfo.hometown)
    formData.append('image', editingMemberInfo.image)

    const response = await membersApi.updateMember(memberId.value, formData)
    console.log(response)
    memberInfo.id = response.data.id
    memberInfo.name = response.data.name
    memberInfo.dateOfBirth = response.data.dateOfBirth
    memberInfo.hometown = response.data.hometown
    memberInfo.imageUrl = response.data.imageUrl

    await getMemberInfo()
    isEnableUpdating.value = false
  } catch (err) {
    console.log(err)
  } finally {
    isUpdating.value = false
  }
}

const enableUpdate = () => {
  editingMemberInfo.id = memberInfo.id
  editingMemberInfo.name = memberInfo.name
  editingMemberInfo.dateOfBirth = memberInfo.dateOfBirth
  editingMemberInfo.hometown = memberInfo.hometown
  editingMemberInfo.image = null
  isEnableUpdating.value = true
}

const roomNavBarItems = [
  {
    name: 'Logs',
  },
  {
    name: 'Rooms',
  },
]

const currentTabIndex = ref(0)
const switchTab = (tabIndex) => {
  currentTabIndex.value = tabIndex
}

onMounted(async () => {
  await getMemberInfo()
})
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <div class="mb-4">
        <Breadcrumbs :crumbs="crumbItems" />
      </div>
      <div class="p-4">
        <div v-if="isEnableUpdating" class="space-y-4 w-max">
          <div>
            <label htmlFor="name" class="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              v-model="editingMemberInfo.name"
              :disabled="isUpdating"
            />
          </div>
          <div>
            <label htmlFor="dob" class="block text-sm font-semibold text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              v-model="editingMemberInfo.dateOfBirth"
              :disabled="isUpdating"
            />
          </div>
          <div>
            <label htmlFor="hometown" class="block text-sm font-semibold text-gray-700 mb-1">
              Hometown
            </label>
            <input
              type="text"
              id="hometown"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              v-model="editingMemberInfo.hometown"
              :disabled="isUpdating"
            />
          </div>
          <div>
            <label htmlFor="dob" class="block text-sm font-semibold text-gray-700 mb-1">
              Image
            </label>
            <input
              id="dob"
              type="file"
              accept=".png,.jpg,.jpeg"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              @change="(event) => (editingMemberInfo.image = event.target.files[0])"
              :disabled="isUpdating"
            />
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              @click="() => (isEnableUpdating = false)"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdating"
            >
              Cancel
            </button>
            <button
              @click="updateMemberInfo"
              class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdating"
            >
              Save Changes
            </button>
          </div>
        </div>
        <div v-else class="space-y-4 w-full">
          <div class="flex flex-col gap-2">
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-baseline">
              <p class="text-md font-semibold text-gray-700">Name:</p>
              <p class="text-sm text-gray-900">{{ memberInfo.name }}</p>

              <p class="text-md font-semibold text-gray-700">Date of Birth:</p>
              <p class="text-sm text-gray-900">{{ memberInfo.dateOfBirth }}</p>

              <p class="text-md font-semibold text-gray-700">Hometown:</p>
              <p class="text-sm text-gray-900">{{ memberInfo.hometown }}</p>
            </div>
            <div class="flex flex-col">
              <p class="text-md font-semibold text-gray-700 mb-2">Profile image:</p>
              <img
                id="memberImage"
                :src="profileImageElement.src"
                :alt="profileImageElement.alt"
                class="block w-[200px]"
                :onload="
                  () => {
                    URL.revokeObjectURL(profileImageElement.src)
                  }
                "
              />
            </div>
          </div>

          <div class="pt-2">
            <button
              @click="enableUpdate"
              class="w-[200px] px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <nav class="w-full bg-white border-b border-gray-200">
        <ul class="flex justify-start items-center px-4">
          <li v-for="(item, index) in roomNavBarItems" class="mr-8">
            <a
              @click="() => switchTab(index)"
              :class="`
                  block py-2 text-lg font-medium transition-all duration-50 ease-in-out
                  ${
                    index === currentTabIndex
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-700 hover:text-indigo-500'
                  }
                `"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
      </nav>

      <MemberLogs v-if="currentTabIndex === 0" />
      <MemberRooms v-if="currentTabIndex === 1" />
    </div>
  </MainLayout>
</template>
