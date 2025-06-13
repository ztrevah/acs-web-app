import api from '.'

const getPendingUsers = (params) => {
  return api.get(`/api/users/pending`, { params })
}

const approvePendingUser = (body, params) => {
  return api.post(`/api/users`, body, { params })
}

const getPendingUserById = (userId, params) => {
  return api.get(`/api/users/pending/${userId}`, { params })
}

const denyPendingUser = (userId, params) => {
  return api.delete(`/api/users/pending/${userId}`, { params })
}

export default {
  getPendingUserById,
  getPendingUsers,
  approvePendingUser,
  denyPendingUser,
}
