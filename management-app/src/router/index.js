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
    component: () => import('@/views/main/DeviceListView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/devices/:id',
    name: 'device_detail',
    component: () => import('@/views/main/DeviceView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('@/views/main/MemberListView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/members/:id',
    name: 'member_detail',
    component: () => import('@/views/main/MemberView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('@/views/main/LogListView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/logs/:id',
    name: 'log_detail',
    component: () => import('@/views/main/LogView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/users-management',
    name: 'users_management',
    component: () => import('@/views/main/UserListView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperAdminRole: true,
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
  const { isSuperAdmin, isAuthenticated } = useAuth()
  const isLoggedIn = await isAuthenticated()
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      next({ path: '/auth/login', query: { redirect: to.fullPath } })
    } else {
      if (to.meta.requiresSuperAdminRole) {
        if (isSuperAdmin()) {
          next()
        } else {
          next({ path: '/' })
        }
      } else {
        next()
      }
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
