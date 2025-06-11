import api from '.'

const getLogs = (params) => {
  return api.get(`/api/logs`, { params })
}

const getLogById = (logId, params) => {
  return api.get(`/api/logs/${logId}`, { params })
}

const getLogsByRoom = (roomId, params) => {
  return api.get(`/api/logs/room/${roomId}`, { params })
}

const getLogsByDevice = (deviceId, params) => {
  return api.get(`/api/logs/device/${deviceId}`, { params })
}

const getLogsByMember = (memberId, params) => {
  return api.get(`/api/logs/civilian/${memberId}`, { params })
}

export default {
  getLogs,
  getLogById,
  getLogsByRoom,
  getLogsByDevice,
  getLogsByMember,
}
