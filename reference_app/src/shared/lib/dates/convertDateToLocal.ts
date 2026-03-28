export const convertDateToLocal = (date: Date): string => {
  const offset = date.getTimezoneOffset()
  const dateWithoutOffset = new Date(date.getTime() - offset * 60 * 1000)
  return dateWithoutOffset.toISOString().slice(0, 16)
}
