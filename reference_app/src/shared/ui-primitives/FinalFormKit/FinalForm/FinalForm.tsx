import {View} from 'react-native'
import {cn} from '@shared/lib/utils'
import type {ReactNode} from 'react'

export function FinalForm({children, className}: FormProps) {
  return <View className={cn(className, 'gap-8')}>{children}</View>
}

// TYPES

interface FormProps {
  children: ReactNode
  className?: string
}
