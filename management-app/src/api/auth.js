import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL ?? 'http://localhost:5176'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const login = (body, params) => {
  return axiosInstance.post(`/api/auth/signin`, body, { params })
}

const signup = (body, params) => {
  return axiosInstance.post(`/api/auth/signup`, body, { params })
}

const refresh = (body, params) => {
  return axiosInstance.post(`/api/auth/refresh`, body, { params })
}

const logout = (body, params) => {
  return axiosInstance.post(`/api/auth/logout`, body, { params })
}

export default {
  login,
  signup,
  refresh,
  logout,
}
