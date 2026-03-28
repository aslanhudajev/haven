export const formatDateRange: TFormatDateRange = (
  fromISO,
  toISO,
  {
    today = new Date(),
    locale = navigator.language || 'en',
    includeTime = true,
    separator = '-',
    month,
  } = {}
) => {
  const from = new Date(fromISO)
  const to = new Date(toISO)

  const sameYear = from.getFullYear() === to.getFullYear()
  const sameMonth = from.getMonth() === to.getMonth()
  const sameDay = from.getDate() === to.getDate()
  const thisYear = from.getFullYear() === today.getFullYear()

  const yearSuffix = thisYear ? '' : `, ${to.getFullYear()}`

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })

  const startTimeSuffix =
    includeTime && (from.getHours() !== 0 || from.getMinutes() !== 0) ? `, ${formatTime(from)}` : ''

  const endTimeSuffix =
    includeTime && (to.getHours() !== 0 || to.getMinutes() !== 0) ? `, ${formatTime(to)}` : ''

  // Full year check
  // Example: 2024
  if (
    from.getTime() === startOf(from, 'year').getTime() &&
    to.getTime() === endOf(to, 'year').getTime()
  ) {
    return `${from.getFullYear()}`
  }

  // Full month check
  if (
    from.getTime() === startOf(from, 'month').getTime() &&
    to.getTime() === endOf(to, 'month').getTime()
  ) {
    if (sameMonth && sameYear) {
      // Example: October 2024
      return from.toLocaleDateString(locale, {month: month ?? 'long', year: 'numeric'})
    }
    // Example: Oct - Nov 2024
    return `${from.toLocaleDateString(locale, {month: 'short'})} ${separator} ${to.toLocaleDateString(locale, {month: 'short', year: 'numeric'})}`
  }

  // Different years
  // Example: Oct 1 2024 - Nov 12 2025
  if (!sameYear) {
    return `${from.toLocaleDateString(locale, {month: 'short', day: 'numeric', year: '2-digit'})}${startTimeSuffix} ${separator} ${to.toLocaleDateString(locale, {month: 'short', day: 'numeric', year: '2-digit'})}${endTimeSuffix}`
  }

  // Different months
  // Example: Oct 1 - Nov 5 2024
  if (!sameMonth) {
    return `${from.toLocaleDateString(locale, {month: 'short', day: 'numeric'})}${startTimeSuffix} ${separator} ${to.toLocaleDateString(locale, {month: 'short', day: 'numeric'})}${endTimeSuffix}${yearSuffix}`
  }

  // Different days
  // Example: Oct 1 - Oct 25 2024
  if (!sameDay) {
    return `${from.toLocaleDateString(locale, {month: 'short', day: 'numeric'})}${startTimeSuffix} ${separator} ${to.toLocaleDateString(locale, {day: 'numeric'})}${endTimeSuffix}${yearSuffix}`
  }

  // Full day
  // Example: October 23, 2024
  return from.toLocaleDateString(locale, {
    month: month ?? 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// PARTS

const startOf = (date: Date, period: 'year' | 'quarter' | 'month' | 'day'): Date => {
  const result = new Date(date)
  if (period === 'year') {
    result.setMonth(0, 1)
    result.setHours(0, 0, 0, 0)
  } else if (period === 'quarter') {
    const quarterStartMonth = Math.floor(result.getMonth() / 3) * 3
    result.setMonth(quarterStartMonth, 1)
    result.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    result.setDate(1)
    result.setHours(0, 0, 0, 0)
  } else if (period === 'day') {
    result.setHours(0, 0, 0, 0)
  }
  return result
}

const endOf = (date: Date, period: 'year' | 'quarter' | 'month' | 'day'): Date => {
  const result = new Date(date)
  if (period === 'year') {
    result.setMonth(11, 31)
    result.setHours(23, 59, 59, 999)
  } else if (period === 'quarter') {
    const quarterEndMonth = Math.floor(result.getMonth() / 3) * 3 + 2
    result.setMonth(quarterEndMonth + 1, 0)
    result.setHours(23, 59, 59, 999)
  } else if (period === 'month') {
    result.setMonth(result.getMonth() + 1, 0)
    result.setHours(23, 59, 59, 999)
  } else if (period === 'day') {
    result.setHours(23, 59, 59, 999)
  }
  return result
}

// TYPES

type TFormatDateRange = (
  fromISO: string,
  toISO: string,
  options?: {
    today?: Date
    locale?: string
    includeTime?: boolean
    separator?: string
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined
  }
) => string
