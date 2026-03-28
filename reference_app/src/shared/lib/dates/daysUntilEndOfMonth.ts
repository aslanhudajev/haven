export const daysUntilEndOfMonth = (): number => {
  const today: Date = new Date()

  const year: number = today.getFullYear()
  const month: number = today.getMonth()

  const firstDayNextMonth: Date = new Date(year, month + 1, 1)

  const diff: number = firstDayNextMonth.getTime() - today.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
