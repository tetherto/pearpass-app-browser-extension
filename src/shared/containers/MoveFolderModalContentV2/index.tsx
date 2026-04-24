import { useCallback, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import {
  AlertMessage,
  Button,
  Dialog,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Folder, Layers, StarBorder } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  useFolders,
  useRecords,
  type UseRecordsResult
} from '@tetherto/pearpass-lib-vault'

import { RecordAvatar } from '../../components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { logger } from '../../utils/logger'

const CHIP_ID_ALL = '__all__'
const CHIP_ID_FAVORITES = '__favorites__'

// Modal params passed to ModalContext.setModal so the kit Dialog's own
// backdrop/focus-trap is the only one on screen (otherwise ModalContext
// would stack its <Overlay/> on top of the Dialog's backdrop).
export const MOVE_FOLDER_MODAL_V2_PARAMS = { hasOverlay: false } as const

export type MoveFolderRecord = {
  id: string
  type?: string
  folder?: string | null
  isFavorite?: boolean
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

type IconComponent = React.ComponentType<{ color?: string }>

type ChipOption =
  | { kind: 'all'; id: typeof CHIP_ID_ALL; label: string; Icon: IconComponent }
  | {
      kind: 'favorites'
      id: typeof CHIP_ID_FAVORITES
      label: string
      Icon: IconComponent
    }
  | { kind: 'custom'; id: string; label: string; Icon: IconComponent }

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
  const { updateFolder, updateFavoriteState, updateRecords } = useRecords({
    onCompleted: closeModal
  }) as UseRecordsResult

  const [selectedId, setSelectedId] = useState<string>(CHIP_ID_ALL)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Redirect Dialog's initial focus away from the X close button (which would
  // otherwise draw a green focus-visible ring on mount) to the default-selected
  // chip, which is a more logical keyboard entry point for a radio group.
  const initialFocusRef = useRef<HTMLDivElement>(null)

  const iconColor = theme.colors.colorTextPrimary

  const chipOptions = useMemo<ChipOption[]>(() => {
    const customFolders = Object.values(folders?.customFolders ?? {}) as Array<{
      name: string
    }>
    const sorted = [...customFolders].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    const custom: ChipOption[] = sorted.map((f) => ({
      kind: 'custom',
      id: f.name,
      label: f.name,
      Icon: Folder as IconComponent
    }))
    return [
      {
        kind: 'all',
        id: CHIP_ID_ALL,
        label: t`All Items`,
        Icon: Layers as IconComponent
      },
      {
        kind: 'favorites',
        id: CHIP_ID_FAVORITES,
        label: t`Favorites`,
        Icon: StarBorder as IconComponent
      },
      ...custom
    ]
  }, [folders])

  const selectedChip = useMemo(
    () => chipOptions.find((c) => c.id === selectedId) ?? chipOptions[0],
    [chipOptions, selectedId]
  )

  // Disable submit when every record already satisfies the chosen destination.
  const atDestination = useMemo(() => {
    if (records.length === 0 || !selectedChip) return true
    switch (selectedChip.kind) {
      case 'all':
        return records.every((r) => !r.folder)
      case 'favorites':
        return records.every((r) => r.isFavorite === true)
      case 'custom':
        return records.every((r) => r.folder === selectedChip.id)
      default:
        return true
    }
  }, [records, selectedChip])

  const isLoadingAny = isLoading || isLoadingFolders
  const canSubmit = !isLoadingAny && !atDestination

  const handleMove = useCallback(async () => {
    if (!canSubmit || !selectedChip) return

    try {
      setIsLoading(true)
      setSubmitError(null)

      const ids = records.map((r) => r.id)

      switch (selectedChip.kind) {
        case 'all':
          await updateRecords(records.map((r) => ({ ...r, folder: null })))
          break
        case 'favorites':
          await updateFavoriteState(ids, true)
          break
        case 'custom':
          await updateFolder(ids, selectedChip.id)
          break
      }

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
    selectedChip,
    setIsLoading,
    updateFavoriteState,
    updateFolder,
    updateRecords
  ])

  const [previewRecord] = records

  return (
    <Dialog
      title={t`Move to another Folder`}
      onClose={closeModal}
      initialFocusRef={initialFocusRef}
      testID="move-folder-v2-dialog"
      closeButtonTestID="move-folder-v2-close"
      footer={
        <div className="flex w-full items-center justify-end gap-[8px]">
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
            {t`Move Item`}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-start gap-[8px] self-stretch p-[16px]">
        {submitError ? (
          <AlertMessage
            variant="error"
            size="small"
            title={t`Something went wrong`}
            description={submitError}
            testID="move-folder-v2-alert"
          />
        ) : null}

        {previewRecord ? (
          <div
            className="flex items-start gap-[12px] rounded-[8px] p-[12px]"
            data-testid="move-folder-v2-preview"
          >
            <RecordAvatar
              websiteDomain={previewRecord.data?.websites?.[0] ?? ''}
              initials={generateAvatarInitials(previewRecord.data?.title ?? '')}
              isFavorite={!!previewRecord.isFavorite}
              color={
                RECORD_COLOR_BY_TYPE[
                  previewRecord.type as keyof typeof RECORD_COLOR_BY_TYPE
                ] ?? RECORD_COLOR_BY_TYPE.custom
              }
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <Text variant="bodyEmphasized">
                {previewRecord.data?.title ?? ''}
              </Text>
              <Text variant="body" color={theme.colors.colorTextSecondary}>
                {getRecordSubtitle(previewRecord)}
              </Text>
            </div>
          </div>
        ) : null}

        <div
          className="flex flex-wrap gap-[8px] self-stretch"
          role="radiogroup"
          aria-label={t`Destination`}
          data-testid="move-folder-v2-chips"
        >
          {chipOptions.map((chip) => {
            const ChipIcon = chip.Icon
            const isSelected = chip.id === selectedId
            const chipClasses = [
              'border-border-secondary flex cursor-pointer items-center gap-[4px] rounded-[8px] border p-[12px]',
              isSelected ? 'bg-surface-elevated-on-interaction' : ''
            ]
              .filter(Boolean)
              .join(' ')

            const handleSelect = () => setSelectedId(chip.id)
            const handleKey = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelect()
              }
            }

            return (
              <div
                key={chip.id}
                ref={isSelected ? initialFocusRef : undefined}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                data-testid={`move-folder-v2-chip-${chip.id}`}
                onClick={handleSelect}
                onKeyDown={handleKey}
                className={chipClasses}
              >
                <ChipIcon color={iconColor} />
                <Text variant="bodyEmphasized">{chip.label}</Text>
              </div>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
