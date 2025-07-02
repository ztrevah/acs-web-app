// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/main/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import { useAuth } from '@/composables/useAuth'
import RoomListView from '@/views/main/RoomListView.vue'
import RoomView from '@/views/main/RoomView.vue'
import DeviceListView from '@/views/main/DeviceListView.vue'
import DeviceView from '@/views/main/DeviceView.vue'
import MemberListView from '@/views/main/MemberListView.vue'
import MemberView from '@/views/main/MemberView.vue'
import LogListView from '@/views/main/LogListView.vue'
import LogView from '@/views/main/LogView.vue'
import UserListView from '@/views/main/UserListView.vue'

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
    component: RoomListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/rooms/:id',
    name: 'room_detail',
    component: RoomView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/devices',
    name: 'devices',
    component: DeviceListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/devices/:id',
    name: 'device_detail',
    component: DeviceView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/members',
    name: 'members',
    component: MemberListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/members/:id',
    name: 'member_detail',
    component: MemberView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/logs/:id',
    name: 'log_detail',
    component: LogView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/users-management',
    name: 'users_management',
    component: UserListView,
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
  const { getUserInfoFromAccessToken, isAuthenticated } = useAuth()
  const isLoggedIn = await isAuthenticated()
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      next({ path: '/auth/login', query: { redirect: to.fullPath } })
    } else {
      if (to.meta.requiresSuperAdminRole) {
        const userInfo = getUserInfoFromAccessToken()
        if (userInfo && userInfo.role === 'SuperAdmin') {
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
