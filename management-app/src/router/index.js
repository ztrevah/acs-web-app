// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/main/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import { useAuth } from '@/composables/useAuth'

const publicRoutes = [
  {
    path: '/auth/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/auth/signup',
    name: 'signup',
    component: SignupView,
  },
]

const protectedRoute = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: () => import('@/views/main/RoomListView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/rooms/:id',
    name: 'room_detail',
    component: () => import('@/views/main/RoomView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/devices',
    name: 'devices',
    component: () => import('@/views/main/DevicesView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('@/views/main/MembersView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...protectedRoute,
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { isAuthenticated } = useAuth()
  const isLoggedIn = await isAuthenticated()
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      next({ path: '/auth/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    if (isLoggedIn) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router
