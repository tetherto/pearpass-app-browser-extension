import type { ComponentType, SVGProps } from 'react'
import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  Breadcrumb,
  Button,
  ContextMenu,
  NavbarListItem,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  CalendarToday,
  Check,
  Checklist,
  FilterList,
  SortByAlpha
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles, SORT_MENU_WIDTH } from './MainViewHeader.styles'
import { useRouter } from '../../../shared/context/RouterContext'
import {
  ALL_ITEMS_TYPE,
  useRecordMenuItemsV2
} from '../../../shared/hooks/useRecordMenuItemsV2'
import { SORT_KEYS, type SortKey } from '../../../shared/constants/sortOptions'
import { isFavorite } from '../../../shared/utils/isFavorite'

type MainViewHeaderProps = {
  sortKey: SortKey
  setSortKey: (key: SortKey) => void
  isMultiSelectOn: boolean
  setIsMultiSelectOn: (value: boolean) => void
}

export const MainViewHeader = ({
  sortKey,
  setSortKey,
  isMultiSelectOn,
  setIsMultiSelectOn
}: MainViewHeaderProps) => {
  const { theme } = useTheme()
  const { state: routerState } = useRouter() as {
    state: { recordType?: string; folder?: string } | undefined
  }
  const { categoriesItems } = useRecordMenuItemsV2()
  const styles = createStyles(theme.colors)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const recordType = routerState?.recordType ?? ALL_ITEMS_TYPE
  const categoryLabel =
    categoriesItems.find((item) => item.type === recordType)?.label ??
    t`All Items`

  const folder = routerState?.folder
  const folderLabel = isFavorite(folder ?? '')
    ? t`Favorites`
    : folder
      ? folder
      : t`All Folders`

  const sortOptions = useMemo<
    Array<{
      key: SortKey
      label: string
      Icon: ComponentType<SVGProps<SVGSVGElement>>
    }>
  >(
    () => [
      { key: SORT_KEYS.TITLE_AZ, label: t`Title (A-Z)`, Icon: SortByAlpha },
      {
        key: SORT_KEYS.LAST_UPDATED_NEWEST,
        label: t`Last Updated (Newest first)`,
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.LAST_UPDATED_OLDEST,
        label: t`Last Updated (Oldest first)`,
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.DATE_ADDED_NEWEST,
        label: t`Date Added (Newest first)`,
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.DATE_ADDED_OLDEST,
        label: t`Date Added (Oldest first)`,
        Icon: CalendarToday
      }
    ],
    []
  )

  const handleSelectSort = (key: SortKey) => {
    setSortKey(key)
    setIsSortOpen(false)
  }

  const iconStyle = { color: theme.colors.colorTextPrimary }

  return (
    <div style={styles.container} data-testid="main-view-header">
      <div style={styles.breadcrumbWrapper}>
        <Breadcrumb
          items={[categoryLabel, folderLabel]}
          actions={
            <div style={styles.actions}>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => setIsMultiSelectOn(!isMultiSelectOn)}
                data-testid="main-view-header-select"
                aria-label={
                  isMultiSelectOn
                    ? t`Exit multi-select`
                    : t`Toggle multi-select`
                }
                aria-pressed={isMultiSelectOn}
                iconBefore={<Checklist style={iconStyle} />}
              />

              <ContextMenu
                open={isSortOpen}
                onOpenChange={setIsSortOpen}
                menuWidth={SORT_MENU_WIDTH}
                testID="main-view-header-sort-menu"
                trigger={
                  <Button
                    variant="tertiary"
                    size="small"
                    data-testid="main-view-header-sort"
                    aria-label={t`Sort items`}
                    iconBefore={<FilterList style={iconStyle} />}
                  />
                }
              >
                {sortOptions.map(({ key, label, Icon }) => (
                  <NavbarListItem
                    key={key}
                    size="small"
                    label={label}
                    testID={`main-view-header-sort-${key}`}
                    icon={<Icon color={theme.colors.colorTextPrimary} />}
                    additionalItems={
                      sortKey === key ? (
                        <Check color={theme.colors.colorTextPrimary} />
                      ) : undefined
                    }
                    onClick={() => handleSelectSort(key)}
                  />
                ))}
              </ContextMenu>
            </div>
          }
        />
      </div>
    </div>
  )
}
