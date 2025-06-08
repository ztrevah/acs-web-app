import api from '.'

const getDevices = (params) => {
  return api.get('/api/devices', { params })
}

const getDeviceById = (deviceId, params) => {
  return api.get(`/api/devices/${deviceId}`, { params })
}

const addDevice = (body, params) => {
  return api.post('/api/devices', body, { params })
}

const updateDevice = (body, params) => {
  return api.put('/api/devices', body, { params })
}

export default {
  getDevices,
  getDeviceById,
  addDevice,
  updateDevice,
}
