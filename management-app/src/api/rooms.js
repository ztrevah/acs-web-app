import api from '.'

const getRooms = async (params) => {
  return api.get('/api/rooms', { params })
}

const getRoomById = async (id, params) => {
  return api.get(`/api/rooms/${id}`, { params })
}

const addRoom = async (body, params) => {
  return api.post('/api/rooms', body, { params })
}

const updateRoom = async (id, body, params) => {
  return api.put(`/api/rooms/${id}`, body, { params })
}

const getRoomMembers = async (id, params) => {
  return api.get(`/api/rooms/${id}`, { params })
}
