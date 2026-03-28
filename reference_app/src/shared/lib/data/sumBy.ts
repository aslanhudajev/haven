export const sumBy = <T>(array: T[], iteratee: ((item: T) => number) | keyof T): number => {
  return array.reduce((sum, item) => {
    const value = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
    return sum + (Number(value) || 0)
  }, 0)
}
