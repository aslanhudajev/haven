export const plus = (num1: number | string, num2: number | string): number => {
  const n1 = typeof num1 === 'string' ? parseFloat(num1) : num1
  const n2 = typeof num2 === 'string' ? parseFloat(num2) : num2

  const factor =
    10 **
    Math.max(n1.toString().split('.')[1]?.length || 0, n2.toString().split('.')[1]?.length || 0)
  return (n1 * factor + n2 * factor) / factor
}

export const minus = (num1: number | string, num2: number | string): number => {
  const n1 = typeof num1 === 'string' ? parseFloat(num1) : num1
  const n2 = typeof num2 === 'string' ? parseFloat(num2) : num2

  const factor =
    10 **
    Math.max(n1.toString().split('.')[1]?.length || 0, n2.toString().split('.')[1]?.length || 0)
  return (n1 * factor - n2 * factor) / factor
}

export const percentageOf = (first: number | string, second: number | string): number => {
  const n1 = typeof first === 'string' ? parseFloat(first) : first
  const n2 = typeof second === 'string' ? parseFloat(second) : second

  return parseFloat(((n2 / n1) * 100).toFixed(2))
}

export const toDecimalPlaces = (number: number, decimalPlaces: number): number => {
  if (decimalPlaces < 0) {
    throw new Error('Invalid input')
  }

  const factor: number = Math.pow(10, decimalPlaces)
  return Math.round(number * factor) / factor
}
