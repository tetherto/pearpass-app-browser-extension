import type { ReactNode } from 'react'

import { t } from '@lingui/core/macro'
import { Button, SearchField, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  ImportOutlined,
  MenuOpen
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './AppHeaderV2.styles'

export type AppHeaderV2Props = {
  searchValue: string
  onSearchChange: (value: string) => void
  onImportClick: () => void
  onSidebarToggle: () => void
  isSidebarCollapsed: boolean
  addItemControl: ReactNode
  searchTestID?: string
  importTestID?: string
  sidebarToggleTestID?: string
}

export const AppHeaderV2 = ({
  searchValue,
  onSearchChange,
  onImportClick,
  onSidebarToggle,
  isSidebarCollapsed,
  addItemControl,
  searchTestID = 'main-search-input',
  importTestID = 'main-import-button',
  sidebarToggleTestID = 'main-sidebar-toggle'
}: AppHeaderV2Props) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const iconStyle = { color: theme.colors.colorTextPrimary }

  return (
    <header style={styles.root} data-testid="app-header-v2">
      <div style={styles.leading}>
        <div style={styles.sidebarToggle(isSidebarCollapsed)}>
          <Button
            variant="tertiary"
            size="medium"
            type="button"
            data-testid={sidebarToggleTestID}
            aria-label={
              isSidebarCollapsed ? t`Expand sidebar` : t`Collapse sidebar`
            }
            aria-pressed={!isSidebarCollapsed}
            onClick={onSidebarToggle}
            iconBefore={<MenuOpen style={iconStyle} />}
          />
        </div>
      </div>
      <div style={styles.searchWrap}>
        <div style={styles.search}>
          <SearchField
            testID={searchTestID}
            size="medium"
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderText={t`Search in All Items`}
          />
        </div>
      </div>
      <div style={styles.actions}>
        <Button
          variant="tertiary"
          size="medium"
          type="button"
          data-testid={importTestID}
          aria-label={t`Import`}
          onClick={onImportClick}
          iconBefore={<ImportOutlined style={iconStyle} />}
        />
        {addItemControl}
      </div>
    </header>
  )
}

type AppHeaderAddItemTriggerProps = {
  testID?: string
  onClick?: () => void
}

export const AppHeaderAddItemTrigger = ({
  testID = 'main-plus-button',
  onClick
}: AppHeaderAddItemTriggerProps) => (
  <Button
    variant="primary"
    size="medium"
    type="button"
    data-testid={testID}
    aria-label={t`Add Item`}
    onClick={onClick}
    iconBefore={<Add />}
  />
)
