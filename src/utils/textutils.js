const capitalizeFirstLetter = (string) => {
  if (typeof string !== 'string') return null
  if (string.length() == 0) return string

  return string.charAt(0).toUpperCase() + (string.length() == 1 ? '' : string.substring(1))
}
