export const daysUntilEndOfYear = (): number => {
  const today: Date = new Date()

  const year: number = today.getFullYear()

  const firstDayNextYear: Date = new Date(year + 1, 0, 1)

  const diff: number = firstDayNextYear.getTime() - today.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
