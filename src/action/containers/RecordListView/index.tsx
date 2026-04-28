import type { MouseEvent } from 'react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { ListItem, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Pressable } from '@tetherto/pearpass-lib-ui-kit/components/Pressable'
import {
  ErrorFilled,
  ExpandMore,
  StarFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './RecordListViewV2.styles'
import { RecordRowContextMenu } from './RecordRowContextMenu'
import { useRouter } from '../../../shared/context/RouterContext'
import { RecordItemIcon } from '../../../shared/containers/RecordItemIcon'
import { getRecordSubtitle } from '../../../shared/utils/getRecordSubtitle'
import type {
  RecordSection,
  VaultRecord
} from '../../../shared/utils/groupRecordsByTimePeriod'

const ROW_RECORD_ID_ATTR = 'data-record-id'

type RecordListViewV2Props = {
  sections: RecordSection[]
  isMultiSelectOn?: boolean
  selectedRecords?: string[]
  setSelectedRecords?: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
  setIsMultiSelectOn?: (value: boolean) => void
}

type ActiveContextMenu = {
  record: VaultRecord
  position: { x: number; y: number }
}

const sectionLabel = (key: string, fallback: string): string => {
  switch (key) {
    case 'favorites':
      return t`Favorites`
    case 'all':
      return t`All Items`
    case 'today':
      return t`Today`
    case 'yesterday':
      return t`Yesterday`
    case 'thisWeek':
      return t`This Week`
    case 'thisMonth':
      return t`This Month`
    case 'older':
      return t`Older`
    default:
      return fallback
  }
}

export const RecordListViewV2 = ({
  sections,
  isMultiSelectOn = false,
  selectedRecords = [],
  setSelectedRecords,
  setIsMultiSelectOn
}: RecordListViewV2Props) => {
  const { theme } = useTheme()
  const { navigate } = useRouter() as {
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
  }
  const styles = createStyles(theme.colors)

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})
  const [activeMenu, setActiveMenu] = useState<ActiveContextMenu | null>(null)

  const allRecords = useMemo(() => sections.flatMap((s) => s.data), [sections])

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const selectedRecordsSet = useMemo(
    () => new Set(selectedRecords),
    [selectedRecords]
  )

  const handleRecordPress = useCallback(
    (record: VaultRecord) => {
      if (isMultiSelectOn) {
        setSelectedRecords?.((prev) =>
          prev.includes(record.id)
            ? prev.filter((id) => id !== record.id)
            : [...prev, record.id]
        )
        return
      }
      navigate('recordDetails', {
        params: { recordId: record.id }
      })
    },
    [isMultiSelectOn, setSelectedRecords, navigate]
  )

  const handleEnterMultiSelect = useCallback(
    (record: VaultRecord) => {
      setSelectedRecords?.((prev) =>
        prev.includes(record.id) ? prev : [...prev, record.id]
      )
      setIsMultiSelectOn?.(true)
    },
    [setIsMultiSelectOn, setSelectedRecords]
  )

  const handleRowContextMenu = useCallback(
    (event: MouseEvent, record: VaultRecord) => {
      if (isMultiSelectOn) return
      event.preventDefault()
      setActiveMenu({
        record,
        position: { x: event.clientX, y: event.clientY }
      })
    },
    [isMultiSelectOn]
  )

  // The overlay covers rows while open; re-target right-clicks via the
  // element stack at the cursor.
  useEffect(() => {
    if (!activeMenu) return
    const handler = (event: globalThis.MouseEvent) => {
      event.preventDefault()
      const stack = document.elementsFromPoint(event.clientX, event.clientY)
      let recordId: string | null = null
      for (const el of stack) {
        const row = (el as HTMLElement).closest?.(
          `[${ROW_RECORD_ID_ATTR}]`
        ) as HTMLElement | null
        if (row) {
          recordId = row.getAttribute(ROW_RECORD_ID_ATTR)
          break
        }
      }
      const next = recordId
        ? allRecords.find((r) => r.id === recordId)
        : undefined
      setActiveMenu(
        next
          ? { record: next, position: { x: event.clientX, y: event.clientY } }
          : null
      )
    }
    document.addEventListener('contextmenu', handler, true)
    return () => document.removeEventListener('contextmenu', handler, true)
  }, [activeMenu, allRecords])

  const iconColor = theme.colors.colorTextSecondary
  const alertColor = theme.colors.colorSurfaceDestructiveElevated

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollArea} data-testid="record-list-v2">
        {sections.map((section, sectionIndex) => {
          const isCollapsed = !!collapsedSections[section.key]
          const label = sectionLabel(section.key, section.title)
          const isLastSection = sectionIndex === sections.length - 1

          return (
            <Fragment key={section.key}>
              <div style={styles.section}>
                <Pressable
                  onClick={() => toggleSection(section.key)}
                  data-testid={`record-list-section-${section.key}`}
                >
                  <div style={styles.sectionHeader}>
                    <div
                      style={{
                        ...styles.sectionHeaderChevron,
                        ...(isCollapsed
                          ? styles.sectionHeaderChevronCollapsed
                          : {})
                      }}
                    >
                      <ExpandMore width={16} height={16} color={iconColor} />
                    </div>

                    {section.isFavorites && (
                      <StarFilled width={14} height={14} color={iconColor} />
                    )}

                    <span>{label}</span>
                  </div>
                </Pressable>

                {!isCollapsed && (
                  <div style={styles.sectionList}>
                    {section.data.map((record) => {
                      const isSelected = selectedRecordsSet.has(record.id)
                      return (
                        <div
                          key={record.id}
                          {...{ [ROW_RECORD_ID_ATTR]: record.id }}
                          onContextMenu={(event) =>
                            handleRowContextMenu(event, record)
                          }
                        >
                          <ListItem
                            icon={<RecordItemIcon record={record} />}
                            iconSize={32}
                            title={record.data?.title ?? ''}
                            subtitle={getRecordSubtitle(record) || undefined}
                            selectionMode={isMultiSelectOn ? 'multi' : 'none'}
                            isSelected={isSelected}
                            onSelect={() => handleRecordPress(record)}
                            onClick={() => handleRecordPress(record)}
                            testID={`record-list-item-${record.id}`}
                            style={
                              styles.recordRow as React.ComponentProps<
                                typeof ListItem
                              >['style']
                            }
                            rightElement={
                              !isMultiSelectOn ? (
                                <div style={styles.rowRightElement}>
                                  {record.hasSecurityAlert && (
                                    <ErrorFilled
                                      width={20}
                                      height={20}
                                      color={alertColor}
                                    />
                                  )}
                                  <div style={styles.rowChevron}>
                                    <ExpandMore
                                      width={20}
                                      height={20}
                                      color={iconColor}
                                    />
                                  </div>
                                </div>
                              ) : undefined
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {!isLastSection && (
                <div
                  style={styles.divider}
                  role="separator"
                  data-testid={`record-list-divider-${section.key}`}
                />
              )}
            </Fragment>
          )
        })}
      </div>

      <div style={styles.fadeGradient} aria-hidden="true" />

      {activeMenu && (
        <RecordRowContextMenu
          key={activeMenu.record.id}
          record={activeMenu.record}
          position={activeMenu.position}
          isOpen
          onOpenChange={(open) => {
            if (!open) setActiveMenu(null)
          }}
          onSelectItem={() => {
            handleEnterMultiSelect(activeMenu.record)
            setActiveMenu(null)
          }}
        />
      )}
    </div>
  )
}
