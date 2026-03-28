import {createMMKV} from 'react-native-mmkv'

export const constantStorageMMKV = createMMKV({
  id: 'money-constant-storage',
})

export const constantStorage = {
  setItem: (name: string, value: string) => {
    return constantStorageMMKV.set(name, value)
  },
  getItem: (name: string) => {
    const value = constantStorageMMKV.getString(name)
    return value ?? null
  },
  getBoolean: (name: string) => {
    return constantStorageMMKV.getBoolean(name)
  },
  setBoolean: (name: string, value: boolean) => {
    return constantStorageMMKV.set(name, value)
  },
  removeItem: (name: string) => {
    return constantStorageMMKV.remove(name)
  },
}
