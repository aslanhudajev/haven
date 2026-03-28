import {cn} from '@shared/lib/utils'
import {Skeleton} from '@shared/ui/skeleton'
import {Text} from '@shared/ui/text'
import type {SlottableTextProps} from '@rn-primitives/types'

const LoadingTypography = ({loading, classes, children, className, ...textProps}: TProps) => {
  return loading ? (
    <Skeleton className={cn('h-4 w-16 rounded-full', classes?.skeleton)} />
  ) : (
    <Text {...textProps} className={className}>
      {children}
    </Text>
  )
}

export default LoadingTypography

// TYPES

type TLoadingTextBaseProps = {
  loading: boolean
  className?: string
  classes?: {
    skeleton?: string
  }
}
type TProps = SlottableTextProps & TLoadingTextBaseProps
