import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: colors.colorSurfacePrimary,
    border: `1px solid ${colors.colorBorderPrimary}`,
    borderRadius: 6,
    overflow: 'hidden' as const
  },

  content: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: colors.colorSurfacePrimary
  }
})
