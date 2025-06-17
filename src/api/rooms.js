import api from '.'

const getRooms = (params) => {
  return api.get('/api/rooms', { params })
}

const getRoomById = (roomId, params) => {
  return api.get(`/api/rooms/${roomId}`, { params })
}

const addRoom = (body, params) => {
  return api.post('/api/rooms', body, { params })
}

const updateRoom = (roomId, body, params) => {
  return api.put(`/api/rooms/${roomId}`, body, { params })
}

const getRoomMembers = (roomId, params) => {
  return api.get(`/api/rooms/${roomId}/members`, { params })
}

const addRoomMembers = (roomId, body, params) => {
  return api.post(`/api/rooms/${roomId}/members`, body, { params })
}

const removeRoomMembers = (roomId, memberId, params) => {
  return api.delete(`/api/rooms/${roomId}/members/${memberId}`, { params })
}

const getRoomDevices = (id, params) => {
  return api.get(`/api/rooms/${id}/devices`, { params })
}

const addRoomDevices = (id, body, params) => {
  return api.post(`/api/rooms/${id}/devices`, body, { params })
}

export default {
  getRooms,
  getRoomById,
  addRoom,
  updateRoom,
  getRoomMembers,
  addRoomMembers,
  removeRoomMembers,
  getRoomDevices,
  addRoomDevices,
}
