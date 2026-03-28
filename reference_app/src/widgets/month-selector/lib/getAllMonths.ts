export function getAllMonths({locale = 'en'} = {}) {
  const applyFormat = new Intl.DateTimeFormat(locale, {month: 'short'}).format
  return [...Array(12).keys()].map((m) => applyFormat(new Date(2024, m)))
}
