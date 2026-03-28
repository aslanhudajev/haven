import {useCallback} from 'react'
import {useUserSettingsStore} from '../../stores/user-settings'
import {type ColorKey, themeVariables} from '../theme/theme'
import {useColorScheme} from '../theme/useColorScheme'

type GetColorOptions = {
  alpha?: number
}

/**
 * Not able to use feature flag in burndown-chart somehow
 */
export function useColorPalette() {
  const preferredPalette = useUserSettingsStore((state) => state.preferredPalette)

  const {colorScheme} = useColorScheme()

  const colorPalette = themeVariables[preferredPalette][colorScheme ?? 'light']

  const getColor = useCallback(
    (colorKey: ColorKey, options?: GetColorOptions) => {
      const {alpha = 1} = options ?? {}
      return `hsla(${colorPalette[colorKey]?.replaceAll(' ', ', ')}, ${alpha})`
    },
    [colorScheme]
  )

  return {
    colorPalette,
    getColor,
  }
}
