export function getMonthIndex(shortMonth: string, locale: string = 'en'): number {
  const formatter = new Intl.DateTimeFormat(locale, {month: 'short'})
  const months = Array.from({length: 12}, (_, i) => formatter.format(new Date(2020, i)))

  return months.indexOf(shortMonth)
}
