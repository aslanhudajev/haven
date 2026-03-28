// Add
import type {TDateISO} from '@shared/lib/dates'

export const addDays = (date: Date | TDateISO, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date: Date | TDateISO, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const addYears = (date: Date | TDateISO, years: number): Date => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

// Subtract

export const subtractDays = (date: Date | TDateISO, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export const subtractMonths = (date: Date | TDateISO, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

export const subtractYears = (date: Date | TDateISO, years: number): Date => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() - years)
  return result
}

// Start

export const startOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export const startOfMonth = (date: Date): Date => {
  const result = new Date(date)
  result.setDate(1)
  return startOfDay(result)
}

export const startOfYear = (date: Date): Date => {
  const result = new Date(date)
  result.setMonth(0, 1)
  return startOfDay(result)
}

// End

export const endOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export const endOfMonth = (date: Date): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1)
  result.setDate(0)
  return endOfDay(result)
}

export const endOfYear = (date: Date): Date => {
  const result = new Date(date)
  result.setMonth(11, 31)
  return endOfDay(result)
}
