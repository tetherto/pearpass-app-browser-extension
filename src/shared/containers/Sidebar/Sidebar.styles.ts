import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const SIDEBAR_WIDTH_EXPANDED = 250
export const SIDEBAR_WIDTH_COLLAPSED = 0
export const SIDEBAR_HEADER_HEIGHT = 44
export const FADE_GRADIENT_HEIGHT = 32
export const FOLDER_CONTEXT_MENU_WIDTH = 200

const SIDEBAR_HORIZONTAL_PADDING = rawTokens.spacing12
const FOLDERS_HEADER_HORIZONTAL_PADDING = rawTokens.spacing4

const COLLAPSED_CHEVRON_WIDTH = 16

// translateX offset to re-center the folders chevron in the collapsed column.
export const FOLDERS_CHEVRON_CENTER_SHIFT_PX =
  (SIDEBAR_WIDTH_COLLAPSED - COLLAPSED_CHEVRON_WIDTH) / 2 -
  (SIDEBAR_HORIZONTAL_PADDING + FOLDERS_HEADER_HORIZONTAL_PADDING)

export const createStyles = (colors: ThemeColors, isCollapsed: boolean) => ({
  wrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100%',
    width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    backgroundColor: colors.colorSurfacePrimary,
    borderRight: isCollapsed
      ? 'none'
      : `1px solid ${colors.colorBorderPrimary}`,
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
    transition: 'width 150ms ease',
    flexShrink: 0
  },

  vaultSelector: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing8,
    width: '100%',
    height: SIDEBAR_HEADER_HEIGHT,
    padding: rawTokens.spacing12,
    borderBottom: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    boxSizing: 'border-box' as const,
    flexShrink: 0
  },

  vaultIconHidden: {
    display: 'none' as const
  },

  vaultNameGroup: {
    flex: 1,
    minWidth: 0
  },

  vaultNameGroupHidden: {
    display: 'none' as const
  },

  vaultNameRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    minWidth: 0,
    cursor: 'pointer' as const,
    userSelect: 'none' as const
  },

  vaultNameText: {
    minWidth: 0,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const
  },

  chevron: {
    flexShrink: 0,
    transition: 'transform 150ms ease'
  },

  chevronFlipped: {
    transform: 'rotate(180deg)'
  },

  scrollContainer: {
    position: 'relative' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0
  },

  scrollArea: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0,
    gap: rawTokens.spacing8,
    paddingInline: rawTokens.spacing12,
    paddingTop: rawTokens.spacing12,
    paddingBottom: FADE_GRADIENT_HEIGHT,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const
  },

  fadeGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_GRADIENT_HEIGHT,
    pointerEvents: 'none' as const,
    background: `linear-gradient(180deg, ${colors.colorSurfacePrimary}00 0%, ${colors.colorSurfacePrimary} 100%)`
  },

  sectionList: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 1,
    width: '100%'
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.colorBorderPrimary,
    border: 'none',
    margin: 0,
    flexShrink: 0
  },

  foldersHeader: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    height: 32,
    padding: `${rawTokens.spacing8}px ${rawTokens.spacing4}px`,
    borderRadius: rawTokens.radius8,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  foldersHeaderToggle: {
    flex: 1,
    minWidth: 0
  },

  foldersHeaderToggleInner: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: rawTokens.spacing4,
    cursor: 'pointer' as const,
    userSelect: 'none' as const
  },

  foldersHeaderLabel: {
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 150ms ease',
    minWidth: 0,
    overflow: 'hidden' as const,
    whiteSpace: 'nowrap' as const
  },

  folderRow: {
    position: 'relative' as const,
    width: '100%'
  },

  folderRowMenuAnchor: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0
  },

  folderRowMenuTrigger: {
    display: 'block' as const,
    width: 0,
    height: 0
  },

  footerSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: isCollapsed ? ('center' as const) : ('stretch' as const),
    gap: 1,
    padding: rawTokens.spacing12,
    borderTop: `1px solid ${colors.colorBorderPrimary}`,
    backgroundColor: colors.colorSurfacePrimary,
    flexShrink: 0
  }
})
