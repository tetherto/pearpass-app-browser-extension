import type { ReactNode } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './LayoutWithSidebar.styles'
import { SidebarV2 } from '../SidebarV2'

type LayoutWithSidebarProps = {
  mainView: ReactNode
}

export const LayoutWithSidebar = ({ mainView }: LayoutWithSidebarProps) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  return (
    <div style={styles.wrapper} data-testid="layout-with-sidebar">
      <SidebarV2 />
      <div style={styles.content}>{mainView}</div>
    </div>
  )
}
