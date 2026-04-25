import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const APP_HEADER_HEIGHT = 64

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: `${APP_HEADER_HEIGHT}px`,
    paddingInline: `${rawTokens.spacing12}px`,
    paddingBlock: `${rawTokens.spacing12}px`,
    width: '100%',
    gap: `${rawTokens.spacing8}px`,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },

  leading: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    flexShrink: 0
  },

  sidebarToggle: (isCollapsed: boolean) => ({
    display: 'flex' as const,
    rotate: `${isCollapsed ? 180 : 0}deg`
  }),

  searchWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex' as const
  },

  search: {
    width: '100%'
  },

  actions: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: `${rawTokens.spacing8}px`,
    flexShrink: 0
  }
})
