export function formatPercentage(value: number, decimals: number = 1): string {
  const factor = 10 ** decimals
  const rounded = Math.round(value * factor) / factor
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals)
}
