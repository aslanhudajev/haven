import {View} from 'react-native'
import {cn} from '@shared/lib/utils'
import type {ReactNode, ReactElement} from 'react'

export const FinalFormFields: T = ({children, className}) => {
  return <View className={cn(className, 'gap-5')}>{children}</View>
}

// TYPES

type T = (props: TProps) => ReactElement
type TProps = {
  children?: ReactNode
  className?: string
}
