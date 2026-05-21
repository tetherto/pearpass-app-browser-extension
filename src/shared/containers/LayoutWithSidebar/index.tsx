import type { ReactNode } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './LayoutWithSidebar.styles'
import { Sidebar } from '../Sidebar'

type LayoutWithSidebarProps = {
  mainView: ReactNode
}

export const LayoutWithSidebar = ({ mainView }: LayoutWithSidebarProps) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  return (
    <div style={styles.wrapper} data-testid="layout-with-sidebar">
      <Sidebar />
      <div style={styles.content}>{mainView}</div>
    </div>
  )
}
