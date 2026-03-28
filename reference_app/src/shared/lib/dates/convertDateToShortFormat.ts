export function convertDateToShortFormat(date?: Date): string {
  if (!date) {
    return ''
  }

  const today = new Date()

  if (isToday(date, today)) {
    return 'Today'
  }

  if (isYesterday(date, today)) {
    return 'Yesterday'
  }

  if (isTomorrow(date, today)) {
    return 'Tomorrow'
  }

  if (isSameYear(date, today)) {
    return formatDateNative(date, 'MMM d')
  }

  return formatDateNative(date, 'P')
}

function isToday(date: Date, today: Date): boolean {
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

function isTomorrow(date: Date, today: Date): boolean {
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  )
}

function isSameYear(date: Date, today: Date): boolean {
  return date.getFullYear() === today.getFullYear()
}

function formatDateNative(date: Date, formatStr: string, locale = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {}

  switch (formatStr) {
    case 'MMM d':
      options.month = 'short'
      options.day = 'numeric'
      break
    case 'P':
      options.year = 'numeric'
      options.month = 'numeric'
      options.day = 'numeric'
      break
    default:
      break
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}
