import api from '.'

const getMembers = (params) => {
  return api.get(`/api/civilians`, { params })
}

const getMemberById = (memberId, params) => {
  return api.get(`/api/civilians/${memberId}`, { params })
}

const addMember = (body, params) => {
  return api.post(`/api/civilians`, body, { params })
}

const updateMember = (memberId, body, params) => {
  return api.post(`/api/civilians/${memberId}`, body, { params })
}

const getAccessibleRoomsByMember = (memberId, params) => {
  return api.get(`/api/civilians/${memberId}/rooms`, { params })
}

export default {
  getMembers,
  getMemberById,
  addMember,
  updateMember,
  getAccessibleRoomsByMember,
}
