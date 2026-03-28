import * as Icons from '@tabler/icons-react-native'
import type {IconProps} from '@tabler/icons-react-native'
import type {FC} from 'react'

export const GenericIcon: FC<TProps> = ({name, ...props}) => {
  const TablerIcon = ICONS[name]

  if (!TablerIcon) {
    console.error(`Icon "${name}" not found`)
    return null
  }

  return <TablerIcon {...props} />
}

//PARTS

const ICONS = Icons as Record<TablerIconName, FC<IconProps>>

// TYPES

type TablerIconName = Extract<keyof typeof Icons, `Icon${string}`>

type TProps = IconProps & {name: TablerIconName}
