<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!(username.value.length > 0) || !(password.value.length > 0)) {
    return
  }

  try {
    isLoading.value = true
    await login({ username: username.value, password: password.value })
    router.push({ path: route.query.redirect ?? '/' })
  } catch (err) {
    console.log(err)
    errorMessage.value = err?.response?.data?.error?.message ?? 'Error'
  } finally {
    isLoading.value = false
  }
}

const handleSignUpRedirect = () => {
  router.push({ path: '/auth/signup', query: { ...route.query } })
}

onMounted(() => {
  if (history.state.signUpSuccess) {
    toast.add({
      severity: 'success',
      summary: 'Successful Sign-up',
      group: 'su',
      life: 10000,
    })

    history.state.signUpSuccess = false
  }
})
</script>

<template>
  <Toast position="top-right" group="su" style="width: max-content">
    <template #message="slotProps">
      <div class="flex items-center gap-x-2 mr-2">
        <i class="pi pi-check-circle"></i>
        <p class="font-medium">Successfully signed up!</p>
      </div>
    </template>
  </Toast>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <form
      class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
      @submit.prevent="handleLogin"
    >
      <div class="p-4 flex items-center justify-center h-20">
        <img src="/src/assets/images/logo.png" alt="App Logo" class="h-15 w-auto" />
      </div>
      <h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
        Welcome Back!
      </h2>

      <div class="mb-6">
        <label for="username" class="block text-gray-700 text-sm font-semibold mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 transition duration-200"
          placeholder="Your username"
          v-model="username"
          aria-label="Username"
          required
        />
        <p v-if="username === null || username.length === 0" class="text-red-500 text-xs mt-1">
          Username is required.
        </p>
      </div>

      <div class="mb-6">
        <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 transition duration-200"
          placeholder="••••••••"
          v-model="password"
          aria-label="Password"
          required
        />
        <p v-if="password === null || password.length === 0" class="text-red-500 text-xs mt-1">
          Password is required.
        </p>
      </div>

      <p v-if="errorMessage.length > 0" class="text-red-500 text-xs font-semibold my-1 text-center">
        {{ errorMessage }}
      </p>
      <button
        @submit.prevent="handleLogin"
        class="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 shadow-lg"
        aria-label="Login"
      >
        Login
        <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
      </button>

      <div class="mt-8 text-center text-gray-600 text-sm">
        Don't have an account?
        <a
          href="/auth/signup"
          class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
          @click.prevent="handleSignUpRedirect"
        >
          Sign Up
        </a>
      </div>
    </form>
  </div>
</template>
