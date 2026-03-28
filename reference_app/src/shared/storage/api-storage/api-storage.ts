import {createMMKV} from 'react-native-mmkv'

export const apiStorageMMKV = createMMKV({
  id: 'money-api-storage',
})

export const apiStorage = {
  setItem: (name: string, value: string) => {
    return apiStorageMMKV.set(name, value)
  },
  getItem: (name: string) => {
    const value = apiStorageMMKV.getString(name)
    return value ?? null
  },
  removeItem: (name: string) => {
    return apiStorageMMKV.remove(name)
  },
}
