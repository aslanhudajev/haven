import {useEffect, useRef} from 'react'

// Used for memoization of complex structures (objects)
export const useChanged = <Value = unknown>(
  next: Value,
  compare: (previous: Value | undefined, next: Value) => boolean
): Value => {
  const previousRef = useRef<Value | undefined>(undefined)
  const previous = previousRef.current

  const isEqual = compare(previous, next)

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next
    }
  })

  return isEqual ? (previous as Value) : next
}
