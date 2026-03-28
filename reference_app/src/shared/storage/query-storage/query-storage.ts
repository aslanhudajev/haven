import {createMMKV} from 'react-native-mmkv'
import {globalStorageMMKV} from '@shared/storage/global-storage'

export const queryStorageMMKV = createMMKV({
  id: 'money-query-storage',
})

export const queryStorage = {
  setItem: (name: string, value: string) => {
    return globalStorageMMKV.set(name, value)
  },
  getItem: (name: string) => {
    const value = globalStorageMMKV.getString(name)
    return value ?? null
  },
  getBoolean: (name: string) => {
    return globalStorageMMKV.getBoolean(name)
  },
  setBoolean: (name: string, value: boolean) => {
    return globalStorageMMKV.set(name, value)
  },
  removeItem: (name: string) => {
    globalStorageMMKV.remove(name)
  },
}
