import {apiStorageMMKV} from '@shared/storage/api-storage'
import {globalStorageMMKV} from '@shared/storage/global-storage'
import {zustandStorageMMKV} from '@shared/storage/zustand-storage'

export const clearStorage = async () => {
  globalStorageMMKV.clearAll()
  apiStorageMMKV.clearAll()
  zustandStorageMMKV.clearAll()
}
