import api from '.'

const getImage = (imagePath, params) => {
  return api.get(imagePath, {
    params,
    responseType: 'blob',
  })
}

export default {
  getImage,
}
