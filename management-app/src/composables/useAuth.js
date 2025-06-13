import authApi from '@/api/auth'
import { jwtDecode } from 'jwt-decode'
import { readonly, ref } from 'vue'

export function useAuth() {
  const currentUser = ref(null)

  const decodeAccessToken = (accessToken) => {
    if (!accessToken) return null

    try {
      const decodedPayload = jwtDecode(accessToken)
      return decodedPayload
    } catch (err) {
      return null
    }
  }

  const isAuthenticated = async () => {
    try {
      const response = await authApi.refresh()
      const accessToken = response.data.accessToken
      const decodedPayload = decodeAccessToken(response.data.accessToken)
      if (decodedPayload === null) {
        return false
      }

      localStorage.setItem('accessToken', accessToken)
      currentUser.value = decodedPayload
      return true
    } catch (err) {
      currentUser.value = null
      localStorage.removeItem('accessToken')
      return false
    }
  }

  const isSuperAdmin = () => {
    return currentUser.value.role === 'SuperAdmin'
  }

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    const accessToken = response.data.accessToken
    const decodedPayload = decodeAccessToken(response.data.accessToken)
    currentUser.value = decodedPayload
    localStorage.setItem('accessToken', accessToken)

    return response
  }

  const logout = async () => {
    await authApi.logout()
    currentUser.value = null
    localStorage.removeItem('accessToken')
  }

  return {
    currentUser: readonly(currentUser),
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
  }
}
