import React from 'react'
import {View} from 'react-native'
import {Text} from '@shared/ui/text'

export const SettingCardGroup = ({children, title}: SettingCardGroupProps) => {
  return (
    <View className="mb-1 gap-2">
      {title && <Text className="text-muted-foreground uppercase">{title}</Text>}
      <View className="overflow-hidden rounded-lg mb-2 bg-secondary group">{children}</View>
    </View>
  )
}

// TYPES

interface SettingCardGroupProps {
  children: React.ReactNode
  title?: string
}
