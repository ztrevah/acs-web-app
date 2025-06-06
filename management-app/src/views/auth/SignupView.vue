<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/auth'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const router = useRouter()
const route = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')

const handleSignUp = async () => {
  if (
    !(username.value.length > 0) ||
    !(password.value.length > 0) ||
    password.value !== confirmPassword.value
  ) {
    return
  }

  try {
    isLoading.value = true
    const response = await authApi.signup({ username: username.value, password: password.value })
    router.push({ path: '/auth/login', query: { ...route.query }, state: { signUpSuccess: true } })
  } catch (err) {
    console.log(err)
    errorMessage.value = err?.response?.data?.error?.message ?? 'Error'
  } finally {
    isLoading.value = false
  }
}

const handleLoginRedirect = () => {
  router.push({ path: '/auth/login', query: { ...route.query } })
}
</script>

<template>
  <form
    class="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter"
    @submit.prevent="handleSignUp"
  >
    <div
      class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
    >
      <div class="p-4 flex items-center justify-center h-20">
        <img src="/src/assets/images/logo.png" alt="App Logo" class="h-15 w-auto" />
      </div>
      <h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
        Create Account
      </h2>

      <div class="mb-6">
        <label for="username" class="block text-gray-700 text-sm font-semibold mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 transition duration-200"
          placeholder="New username"
          v-model="username"
          aria-label="Username"
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
        />
        <p v-if="password === null || password.length === 0" class="text-red-500 text-xs mt-1">
          Password is required.
        </p>
      </div>

      <div class="mb-6">
        <label for="confirmPassword" class="block text-gray-700 text-sm font-semibold mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 transition duration-200"
          placeholder="••••••••"
          v-model="confirmPassword"
          aria-label="Confirm Password"
        />
        <p
          v-if="password !== confirmPassword && confirmPassword !== ''"
          class="text-red-500 text-xs mt-1"
        >
          Passwords do not match.
        </p>
      </div>

      <p v-if="errorMessage.length > 0" class="text-red-500 text-xs my-1 text-center">
        {{ errorMessage }}
      </p>
      <button
        @submit.prevent="handleSignUp"
        class="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 shadow-lg"
        aria-label="Sign Up"
        :disabled="isLoading"
      >
        Sign Up
        <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
      </button>

      <div class="mt-8 text-center text-gray-600 text-sm">
        Already have an account?
        <a
          href="#"
          class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
          @click.prevent="handleLoginRedirect"
        >
          Login here
        </a>
      </div>
    </div>
  </form>
</template>
