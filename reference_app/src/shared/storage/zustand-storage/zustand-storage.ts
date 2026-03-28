import {createMMKV} from 'react-native-mmkv'
import type {StateStorage} from 'zustand/middleware'

export const zustandStorageMMKV = createMMKV({
  id: 'money-store-storage',
})

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return zustandStorageMMKV.set(name, value)
  },
  getItem: (name) => {
    const value = zustandStorageMMKV.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    return zustandStorageMMKV.remove(name)
  },
}
