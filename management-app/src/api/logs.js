import api from '.'

const getLogs = (params) => {
  return api.get(`/api/logs`, { params })
}

const getLogsByRoom = (roomId, params) => {
  return api.get(`/api/logs/rooms/${roomId}`, { params })
}

const getLogsByDevice = (deviceId, params) => {
  return api.get(`/api/logs/devices/${deviceId}`, { params })
}

const getLogsByMember = (memberId, params) => {
  return api.get(`/api/logs/civilians/${memberId}`, { params })
}

export default {
  getLogs,
  getLogsByRoom,
  getLogsByDevice,
  getLogsByMember,
}
