import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors, size: number) => ({
  wrapper: {
    width: size,
    height: size,
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'hidden' as const,
    backgroundColor: colors.colorSurfaceHover,
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    flexShrink: 0
  },

  image: {
    width: size,
    height: size,
    borderRadius: `${rawTokens.radius8}px`,
    objectFit: 'contain' as const
  }
})
