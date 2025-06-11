import dayjs from 'dayjs'

const hasTimezoneIndicator = (dateString) => {
  // Regex to check for 'Z' at the end or an offset like +HH:MM / -HH:MM
  return /[Z+\-]\d{2}:\d{2}$|Z$/.test(dateString)
}

export const convertUtcIsoDateTime = (datetime) => {
  if (!hasTimezoneIndicator(datetime)) datetime += 'Z'
  const localIsoDateTime = dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')

  return localIsoDateTime
}
