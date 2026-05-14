import { useCallback, useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  Breadcrumb,
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  CalendarToday,
  Check,
  Checklist,
  ContentCopy,
  FilterList,
  SortByAlpha
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  formatOtpCode,
  // @ts-expect-error - groupOtpRecords is exported at runtime but absent from the package's main type declarations
  groupOtpRecords,
  isExpiring,
  useFolders,
  useRecords
} from '@tetherto/pearpass-lib-vault'
import type {
  OtpGroupResult,
  OtpPublic
} from '@tetherto/pearpass-lib-vault/src/types'

import { createStyles } from './styles'
import { EmptyResultsViewV2 } from '../../containers/EmptyResultsViewV2'
import { MultiSelectActionsBar } from '../../containers/MultiSelectActionsBar'
import { RecordDetailsV2 } from '../../containers/RecordDetails/RecordDetailsV2'
import { createStyles as createListStyles } from '../../containers/RecordListView/RecordListViewV2.styles'
import { TimerCircle } from '../../../shared/components/TimerCircle'
import {
  SORT_BY_TYPE,
  SORT_KEYS,
  type SortKey
} from '../../../shared/constants/sortOptions'
import { DeleteRecordsModalContentV2 } from '../../../shared/containers/DeleteRecordsModalContentV2'
import { MoveFolderModalContentV2 } from '../../../shared/containers/MoveFolderModalContentV2'
import { RecordItemIcon } from '../../../shared/containers/RecordItemIcon'
import { useAppHeaderContext } from '../../../shared/context/AppHeaderContext'
import { useModal } from '../../../shared/context/ModalContext'
import { getRecordSubtitle } from '../../../shared/utils/getRecordSubtitle'
import type { VaultRecord } from '../../../shared/utils/groupRecordsByTimePeriod'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

const SORT_MENU_WIDTH = 260

type OtpRecord = VaultRecord & {
  folder?: string | null
  otpPublic?: OtpPublic
}

export const AuthenticatorView = () => {
  const { theme } = useTheme()
  const { setModal, isOpen: isModalOpen } = useModal()
  const { searchValue } = useAppHeaderContext() as { searchValue: string }
  const { copyToClipboard } = useCopyToClipboard() as {
    copyToClipboard: (text: string) => void
  }
  const styles = createStyles(theme.colors)
  const listStyles = createListStyles(theme.colors)

  const [sortKey, setSortKey] = useState<SortKey>(SORT_KEYS.LAST_UPDATED_NEWEST)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  const sort = useMemo(() => SORT_BY_TYPE[sortKey], [sortKey])

  const { data: records, updateFavoriteState } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        hasOtp: true,
        searchPattern: searchValue
      },
      sort
    }
  }) as {
    data: OtpRecord[] | undefined
    updateFavoriteState: (ids: string[], isFavorite: boolean) => Promise<void>
  }

  const otpRecords = useMemo<OtpRecord[]>(
    () => (records ?? []).filter((r) => r.otpPublic),
    [records]
  )

  const groupResult = useMemo<OtpGroupResult>(
    () => groupOtpRecords(otpRecords),
    [otpRecords]
  )
  const totpGroups = groupResult.totpGroups as {
    period: number
    records: OtpRecord[]
  }[]
  const hotpRecords = groupResult.hotpRecords as OtpRecord[]

  const selectedRecordsSet = useMemo(
    () => new Set(selectedRecords),
    [selectedRecords]
  )

  const selectedRecordObjects = useMemo<OtpRecord[]>(() => {
    if (!records?.length || !selectedRecords.length) return []
    const ids = new Set(selectedRecords)
    return records.filter((r) => ids.has(r.id))
  }, [records, selectedRecords])

  const selectedCount = selectedRecordObjects.length
  const allSelectedFavorited =
    selectedCount > 0 && selectedRecordObjects.every((r) => !!r.isFavorite)

  const { data: foldersData } = useFolders() as {
    data: { customFolders?: Record<string, unknown> } | undefined
  }
  const hasCustomFolders =
    Object.keys(foldersData?.customFolders ?? {}).length > 0

  useEffect(() => {
    if (!isMultiSelectOn) setSelectedRecords([])
  }, [isMultiSelectOn])

  useEffect(() => {
    setIsMultiSelectOn(false)
    setSelectedRecordId(null)
  }, [searchValue])

  useEffect(() => {
    if (isMultiSelectOn) setSelectedRecordId(null)
  }, [isMultiSelectOn])

  useEffect(() => {
    if (!selectedRecordId) return
    const stillExists = records?.some((r) => r.id === selectedRecordId)
    if (!stillExists) setSelectedRecordId(null)
  }, [records, selectedRecordId])

  const exitMultiSelect = useCallback(() => {
    setSelectedRecords([])
    setIsMultiSelectOn(false)
  }, [])

  useEffect(() => {
    if (!isMultiSelectOn || isModalOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitMultiSelect()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMultiSelectOn, isModalOpen, exitMultiSelect])

  const handleRecordPress = useCallback(
    (record: OtpRecord) => {
      if (isMultiSelectOn) {
        setSelectedRecords((prev) =>
          prev.includes(record.id)
            ? prev.filter((id) => id !== record.id)
            : [...prev, record.id]
        )
        return
      }
      setSelectedRecordId((current) =>
        current === record.id ? null : record.id
      )
    },
    [isMultiSelectOn]
  )

  const handleMove = () => {
    if (!selectedCount) return
    setModal(
      <MoveFolderModalContentV2
        records={selectedRecordObjects}
        onCompleted={exitMultiSelect}
      />
    )
  }

  const handleDelete = () => {
    if (!selectedCount) return
    setModal(
      <DeleteRecordsModalContentV2
        records={selectedRecordObjects}
        onCompleted={exitMultiSelect}
      />
    )
  }

  const handleToggleFavorite = async () => {
    if (!selectedCount) return
    await updateFavoriteState(selectedRecords, !allSelectedFavorited)
    exitMultiSelect()
  }

  const sortOptions = useMemo(
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

  const iconColor = theme.colors.colorTextPrimary

  const renderRecordRow = (record: OtpRecord) => {
    const code = record.otpPublic?.currentCode ?? null
    const isSelected = selectedRecordsSet.has(record.id)
    return (
      <ListItem
        key={record.id}
        icon={<RecordItemIcon record={record} />}
        iconSize={32}
        title={record.data?.title ?? ''}
        subtitle={getRecordSubtitle(record) || undefined}
        selectionMode={isMultiSelectOn ? 'multi' : 'none'}
        isSelected={isSelected}
        selected={!isMultiSelectOn && selectedRecordId === record.id}
        onSelect={() => handleRecordPress(record)}
        onClick={() => handleRecordPress(record)}
        testID={`authenticator-record-item-${record.id}`}
        style={
          listStyles.recordRow as React.ComponentProps<typeof ListItem>['style']
        }
        rightElement={
          !isMultiSelectOn ? (
            <div style={listStyles.rowRightElement}>
              <Text variant="labelEmphasized">{formatOtpCode(code ?? '')}</Text>
              <Button
                variant="tertiary"
                size="small"
                data-testid={`authenticator-record-copy-${record.id}`}
                aria-label={t`Copy code`}
                iconBefore={<ContentCopy color={iconColor} />}
                onClick={(event) => {
                  event.stopPropagation()
                  if (code) copyToClipboard(code)
                }}
              />
            </div>
          ) : undefined
        }
      />
    )
  }

  const hasRecords = otpRecords.length > 0
  const hasDetailsPane = !!selectedRecordId && !isMultiSelectOn

  const listPane = (
    <div style={styles.listPane}>
      <div style={styles.headerContainer}>
        <div style={styles.breadcrumbWrapper}>
          <Breadcrumb
            items={[t`Authenticator`]}
            actions={
              <div style={styles.headerActions}>
                <Button
                  variant="tertiary"
                  size="small"
                  data-testid="authenticator-header-multi-select"
                  aria-label={
                    isMultiSelectOn
                      ? t`Exit multi-select`
                      : t`Toggle multi-select`
                  }
                  aria-pressed={isMultiSelectOn}
                  onClick={() => setIsMultiSelectOn((prev) => !prev)}
                  iconBefore={<Checklist color={iconColor} />}
                />
                <ContextMenu
                  open={isSortOpen}
                  onOpenChange={setIsSortOpen}
                  menuWidth={SORT_MENU_WIDTH}
                  testID="authenticator-sort-menu"
                  trigger={
                    <Button
                      variant="tertiary"
                      size="small"
                      data-testid="authenticator-header-sort"
                      aria-label={t`Sort items`}
                      iconBefore={<FilterList color={iconColor} />}
                    />
                  }
                >
                  {sortOptions.map(({ key, label, Icon }) => (
                    <NavbarListItem
                      key={key}
                      size="small"
                      label={label}
                      testID={`authenticator-sort-${key}`}
                      icon={<Icon color={iconColor} />}
                      additionalItems={
                        sortKey === key ? (
                          <Check color={iconColor} />
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

      {isMultiSelectOn && (
        <MultiSelectActionsBar
          selectedCount={selectedCount}
          allSelectedFavorited={allSelectedFavorited}
          canMove={hasCustomFolders}
          onMove={handleMove}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      {!hasRecords && !!searchValue ? (
        <EmptyResultsViewV2 />
      ) : !hasRecords ? (
        <div style={styles.emptyState} data-testid="authenticator-empty-state">
          <Text variant="label" color={theme.colors.colorTextSecondary}>
            {t`No codes saved`}
          </Text>
        </div>
      ) : (
        <div style={listStyles.wrapper}>
          <div
            style={listStyles.scrollArea}
            data-testid="authenticator-record-list"
          >
            {totpGroups.map(({ period, records: groupRecords }, groupIndex) => {
              const timeRemaining =
                groupRecords[0]?.otpPublic?.timeRemaining ?? null
              const expiring = isExpiring(timeRemaining)
              const timerColor = expiring
                ? theme.colors.colorTextDestructive
                : theme.colors.colorPrimary
              const isLastTotpGroup = groupIndex === totpGroups.length - 1
              const hasNext = !isLastTotpGroup || hotpRecords.length > 0

              return (
                <div key={period} style={listStyles.section}>
                  <div style={styles.staticSectionHeader}>
                    <TimerCircle
                      timeRemaining={timeRemaining}
                      period={period}
                    />
                    <span>
                      {t`Codes expiring in`}{' '}
                      <Text variant="labelEmphasized" color={timerColor}>
                        {timeRemaining !== null
                          ? `${timeRemaining}s`
                          : `${period}s`}
                      </Text>
                    </span>
                  </div>
                  <div style={listStyles.sectionList}>
                    {groupRecords.map((record) => renderRecordRow(record))}
                  </div>
                  {hasNext && <div style={listStyles.divider} />}
                </div>
              )
            })}
            {hotpRecords.length > 0 && (
              <div style={listStyles.section}>
                <div style={styles.staticSectionHeader}>
                  <span>{t`Counter-based`}</span>
                </div>
                <div style={listStyles.sectionList}>
                  {hotpRecords.map((record) => renderRecordRow(record))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  if (hasDetailsPane) {
    return (
      <div style={styles.detailsWrapper}>
        {listPane}
        <div style={styles.separator} role="separator" aria-hidden="true" />
        <div style={styles.detailsPane}>
          <RecordDetailsV2
            recordId={selectedRecordId ?? undefined}
            onClose={() => setSelectedRecordId(null)}
          />
        </div>
      </div>
    )
  }

  return listPane
}
