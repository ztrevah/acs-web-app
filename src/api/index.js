import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL ?? 'http://localhost:5176'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor to attach the access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        )

        const newAccessToken = response.data.accessToken
        localStorage.setItem('accessToken', newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = `/auth/login?redirect=${window.location.href}`
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default api
