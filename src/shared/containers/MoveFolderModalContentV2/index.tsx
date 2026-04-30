import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import {
  AlertMessage,
  Button,
  Dialog,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Folder } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { RecordAvatar } from '../../components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useScrollOverflow } from '../../hooks/useScrollOverflow'
import { logger } from '../../utils/logger'
import { sortByName } from '../../utils/sortByName'
import { FADE_GRADIENT_HEIGHT } from '../SidebarV2/SidebarV2.styles'

export type MoveFolderRecord = {
  id: string
  type?: string
  folder?: string | null
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: string[]
    [key: string]: unknown
  }
}

export type MoveFolderModalContentV2Props = {
  records: MoveFolderRecord[]
  onCompleted?: () => void
}

type FolderOption = {
  id: string
  label: string
}

function getRecordSubtitle(record: MoveFolderRecord): string {
  if (record.type === 'login' || record.type === 'identity') {
    return String(
      record.data?.username ??
        record.data?.email ??
        record.data?.websites?.[0] ??
        ''
    )
  }
  return record.folder ? String(record.folder) : ''
}

export const MoveFolderModalContentV2 = ({
  records,
  onCompleted
}: MoveFolderModalContentV2Props) => {
  const { theme } = useTheme()
  const { closeModal } = useModal()
  const { isLoading, setIsLoading } = useLoadingContext()
  const { data: folders, isLoading: isLoadingFolders } = useFolders()
  const { updateFolder } = useRecords({ onCompleted: closeModal })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const itemsListRef = useRef<HTMLDivElement>(null)
  const hasItemsOverflow = useScrollOverflow(itemsListRef, [records.length])

  const iconColor = theme.colors.colorTextPrimary

  const folderOptions = useMemo<FolderOption[]>(() => {
    const customFolders = Object.values(
      (folders?.customFolders ?? {}) as Record<string, { name: string }>
    )
    return sortByName(customFolders).map(({ name }) => ({
      id: name,
      label: name
    }))
  }, [folders])

  const recordIdsKey = useMemo(
    () =>
      records
        .map((r) => r.id)
        .sort()
        .join(','),
    [records]
  )
  const folderListKey = useMemo(
    () => folderOptions.map((f) => f.id).join(','),
    [folderOptions]
  )

  useEffect(() => {
    setSelectedId(null)
    setSubmitError(null)
  }, [recordIdsKey, folderListKey])

  const atDestination =
    !!selectedId &&
    records.length > 0 &&
    records.every((r) => r.folder === selectedId)

  const isLoadingAny = isLoading || isLoadingFolders
  const canSubmit = !isLoadingAny && !!selectedId && !atDestination

  const isSingle = records.length === 1
  const dialogTitle = isSingle
    ? t`Move 1 item`
    : t`Move ${records.length} items`
  const submitLabel = isSingle ? t`Move item` : t`Move items`
  const selectedItemsLabel = isSingle ? t`Selected Item` : t`Selected Items`
  const destinationHintLabel = isSingle
    ? t`Choose the destination folder of this item`
    : t`Choose the destination folder of these items`

  const handleMove = useCallback(async () => {
    if (!canSubmit || !selectedId) return

    try {
      setIsLoading(true)
      setSubmitError(null)
      await updateFolder(
        records.map((r) => r.id),
        selectedId
      )
      onCompleted?.()
      closeModal()
    } catch (error) {
      logger.error('MoveFolderModalContentV2', 'Error moving records:', error)
      setSubmitError(t`Could not move the items. Try again.`)
    } finally {
      setIsLoading(false)
    }
  }, [
    canSubmit,
    closeModal,
    onCompleted,
    records,
    selectedId,
    setIsLoading,
    updateFolder
  ])

  return (
    <Dialog
      title={dialogTitle}
      onClose={closeModal}
      testID="move-folder-v2-dialog"
      closeButtonTestID="move-folder-v2-close"
      footer={
        <div className="flex w-full items-center justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            onClick={closeModal}
            data-testid="move-folder-v2-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={!canSubmit}
            isLoading={isLoading}
            onClick={() => {
              void handleMove()
            }}
            data-testid="move-folder-v2-submit"
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-start gap-[var(--spacing12)] self-stretch">
        {submitError ? (
          <AlertMessage
            variant="error"
            size="small"
            title={t`Something went wrong`}
            description={submitError}
            testID="move-folder-v2-alert"
          />
        ) : null}

        <div className="shrink-0">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {selectedItemsLabel}
          </Text>
        </div>

        {records.length > 0 ? (
          <div className="relative min-h-0 w-full flex-1">
            <div
              ref={itemsListRef}
              className="flex h-full w-full flex-col gap-[var(--spacing4)] overflow-y-auto"
              style={{
                paddingBottom: hasItemsOverflow ? FADE_GRADIENT_HEIGHT : 0
              }}
              data-testid="move-folder-v2-items"
            >
              {records.map((record, index) => {
                const subtitle = getRecordSubtitle(record)
                const titleText = record.data?.title ?? ''
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-[var(--spacing12)] p-[var(--spacing12)]"
                    data-testid={`move-folder-v2-item-${index}`}
                  >
                    <RecordAvatar
                      websiteDomain={record.data?.websites?.[0] ?? ''}
                      initials={generateAvatarInitials(
                        record.data?.title ?? ''
                      )}
                      isFavorite={false}
                      color={
                        RECORD_COLOR_BY_TYPE[
                          record.type as keyof typeof RECORD_COLOR_BY_TYPE
                        ] ?? RECORD_COLOR_BY_TYPE.custom
                      }
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                      <Text variant="bodyEmphasized">{titleText}</Text>
                      {subtitle ? (
                        <Text
                          variant="caption"
                          color={theme.colors.colorTextSecondary}
                        >
                          {subtitle}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
            {hasItemsOverflow ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: FADE_GRADIENT_HEIGHT,
                  pointerEvents: 'none',
                  background: `linear-gradient(180deg, ${theme.colors.colorSurfacePrimary}00 0%, ${theme.colors.colorSurfacePrimary} 100%)`
                }}
              />
            ) : null}
          </div>
        ) : null}

        <div className="shrink-0">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {destinationHintLabel}
          </Text>
        </div>

        <div
          className="flex max-h-[100px] shrink-0 flex-wrap gap-[var(--spacing12)] self-stretch overflow-y-auto"
          data-testid="move-folder-v2-chips"
        >
          {folderOptions.map(({ id, label }) => {
            const selected = id === selectedId
            return (
              <Button
                key={id}
                variant="secondary"
                size="small"
                pressed={selected}
                iconBefore={<Folder color={iconColor} />}
                data-testid={`move-folder-v2-chip-${id}`}
                onClick={() =>
                  setSelectedId((prev) => (prev === id ? null : id))
                }
              >
                {label}
              </Button>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
