export const convertDateToLocalISOString: T = (dateRaw, {skipTime = false} = {}) => {
  const date = new Date(dateRaw)
  const localISODate = new Date(date.getTime() - date.getTimezoneOffset() * MUN_IN_MS)
    .toISOString()
    .replace(/Z$/, '')

  if (skipTime) {
    return localISODate.replace(/T.+$/, '')
  }

  return localISODate
}

// PARTS

const MUN_IN_MS = 60000

// TYPES

type T = (date: string | number | Date, options?: TOptions) => string
type TOptions = {
  skipTime?: boolean
}
