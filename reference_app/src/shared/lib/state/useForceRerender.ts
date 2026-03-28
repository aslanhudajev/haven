import {useReducer} from 'react'

export const useForceRerender = () => {
  const [, rerender] = useReducer((x) => x + 1, 0)
  return rerender
}
