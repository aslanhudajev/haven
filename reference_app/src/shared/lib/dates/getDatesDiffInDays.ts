export const getDatesDiffInDays: T = (dateARaw, dateBRaw) => {
  const dateA = new Date(dateARaw)
  const dateB = new Date(dateBRaw)
  const dateATimestampWithoutTime = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate())
  const dateBTimestampWithoutTime = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate())
  const datesDiffRaw = (dateBTimestampWithoutTime - dateATimestampWithoutTime) / DAY_IN_MS
  const datesDiff = datesDiffRaw < 0 ? Math.ceil(datesDiffRaw) : Math.floor(datesDiffRaw)

  return datesDiff
}

// PARTS

const DAY_IN_MS = 86400000

// TYPES

type T = (dateA: string | number | Date, dateB: string | number | Date) => number
