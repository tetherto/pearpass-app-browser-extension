import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const HEADER_MIN_HEIGHT = 44
export const SORT_MENU_WIDTH = 260

export const createStyles = (colors: ThemeColors) => ({
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    height: `${HEADER_MIN_HEIGHT}px`,
    paddingInline: `${rawTokens.spacing12}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },

  breadcrumbWrapper: {
    flex: 1,
    minWidth: 0,
    display: 'flex' as const,
    alignItems: 'center' as const
  },

  actions: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`
  }
})
