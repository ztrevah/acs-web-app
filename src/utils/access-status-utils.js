import { LocalDateTime, ZoneOffset } from '@js-joda/core'

export const AccessStatus = {
  ALLOWED: 'Allowed',
  DISABLED: 'Disabled',
  EXPIRED: 'Expired',
  PENDING: 'Pending',
  UNKNOWN: 'Unknown',
}

export const getAccessStatus = (roomMember) => {
  if (roomMember == null) {
    return AccessStatus.UNKNOWN
  }

  const now = LocalDateTime.now(ZoneOffset.UTC)
  if (
    roomMember.disabledStartTime &&
    LocalDateTime.parse(roomMember.disabledStartTime).isBefore(now) &&
    LocalDateTime.parse(roomMember.disabledEndTime).isAfter(now)
  ) {
    return AccessStatus.DISABLED
  }

  if (LocalDateTime.parse(roomMember.startTime).isAfter(now)) {
    return AccessStatus.PENDING
  }

  if (LocalDateTime.parse(roomMember.endTime).isBefore(now)) {
    return AccessStatus.EXPIRED
  }

  return AccessStatus.ALLOWED
}

export const getAccessStatusTextColor = (status) => {
  switch (status) {
    case AccessStatus.ALLOWED:
      return 'text-green-600'
    case AccessStatus.DISABLED:
      return 'text-yellow-600'
    case AccessStatus.EXPIRED:
      return 'text-red-600'
    case AccessStatus.PENDING:
      return 'text-indigo-600'
    default:
      return ''
  }
}
