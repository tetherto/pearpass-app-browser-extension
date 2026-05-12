import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

// 44 px is the standard minimum tap/click target; no exact token maps to this value
const HEADER_MIN_HEIGHT = 44

export const createStyles = (colors: ThemeColors) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    backgroundColor: colors.colorSurfacePrimary,
    overflow: 'hidden' as const
  },
  headerContainer: {
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
  headerActions: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`
  },
  staticSectionHeader: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: `${rawTokens.spacing4}px`,
    paddingBlock: `${rawTokens.spacing8}px`,
    paddingInline: `${rawTokens.spacing4}px`,
    background: 'transparent',
    border: 'none',
    userSelect: 'none' as const,
    color: colors.colorTextPrimary,
    width: '100%'
  },
  listPane: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: colors.colorSurfacePrimary,
    overflow: 'hidden' as const
  },
  emptyState: {
    display: 'flex' as const,
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: `${rawTokens.spacing24}px`,
    textAlign: 'center' as const
  },
  detailsWrapper: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    flex: 1,
    minHeight: 0
  },
  separator: {
    width: '1px',
    backgroundColor: colors.colorBorderPrimary,
    flexShrink: 0
  },
  detailsPane: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: 0,
    minHeight: 0
  }
})
