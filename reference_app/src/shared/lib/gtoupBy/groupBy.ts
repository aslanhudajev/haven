export function groupBy<T>(items: T[], key: keyof T): {title: T[keyof T]; data: T[]}[] {
  return items.reduce((result: {title: T[keyof T]; data: T[]}[], item: T) => {
    const group = result.find((g) => g.title === item[key])

    if (group) {
      group.data.push(item)
    } else {
      result.push({
        title: item[key],
        data: [item],
      })
    }

    return result
  }, [])
}
