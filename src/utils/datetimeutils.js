import { DateTimeFormatter, ZonedDateTime, ZoneOffset } from '@js-joda/core'

const hasTimezoneIndicator = (dateString) => {
  return /[Z+\-]\d{2}:\d{2}$|Z$/.test(dateString)
}

export const convertUtcIsoDateTimeToLocal = (datetime) => {
  if (!datetime) return null
  if (!hasTimezoneIndicator(datetime)) datetime += 'Z'
  const utcDateTime = ZonedDateTime.parse(datetime)

  const localDateTime = utcDateTime
    .withZoneSameInstant(ZoneOffset.systemDefault())
    .toLocalDateTime()

  return localDateTime.format(DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm:ss'))
}
