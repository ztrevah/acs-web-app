import api from '.'

const getDashboardInfo = (params) => {
  return api.get('/api/dashboard', { params })
}

export default {
  getDashboardInfo,
}
