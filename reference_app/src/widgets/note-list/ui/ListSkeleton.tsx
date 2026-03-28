import {View} from 'react-native'
import {Skeleton} from '@shared/ui/skeleton'

export function ListSkeleton() {
  return (
    <View className="flex flex-col gap-4 mt-8">
      <View className="flex-row items-center gap-4">
        <View className="flex flex-1 flex-col gap-4">
          <Skeleton className="w-[30%] h-4 rounded-full" />
          <Skeleton className="w-full h-4 rounded-full" />
        </View>
        <Skeleton className="h-16 w-16 rounded-lg" />
      </View>
      <View className="flex-row items-center gap-4">
        <View className="flex flex-1 flex-col gap-4">
          <Skeleton className="w-[30%] h-4 rounded-full" />
          <Skeleton className="w-full h-4 rounded-full" />
        </View>
        <Skeleton className="h-16 w-16 rounded-lg" />
      </View>
      <View className="flex-row items-center gap-4">
        <View className="flex flex-1 flex-col gap-4">
          <Skeleton className="w-[30%] h-4 rounded-full" />
          <Skeleton className="w-full h-4 rounded-full" />
        </View>
        <Skeleton className="h-16 w-16 rounded-lg" />
      </View>
    </View>
  )
}
