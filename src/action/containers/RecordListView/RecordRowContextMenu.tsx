import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'

import { t } from '@lingui/core/macro'
import { UNSUPPORTED } from '@tetherto/pearpass-lib-constants'
import {
  NavbarListItem,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  CheckBox,
  CopyAll,
  DriveFileMoveOutlined,
  EditOutlined,
  Share,
  StarOutlined,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useCreateRecord, vaultGetFile } from '@tetherto/pearpass-lib-vault'

import { useModal } from '../../../shared/context/ModalContext'
import { DeleteRecordsModalContentV2 } from '../../../shared/containers/DeleteRecordsModalContentV2'
import { MoveFolderModalContentV2 } from '../../../shared/containers/MoveFolderModalContentV2'
import { useRecordActionItems } from '../../../shared/hooks/useRecordActionItems'
import type { VaultRecord } from '../../../shared/utils/groupRecordsByTimePeriod'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'

export const RECORD_ROW_CONTEXT_MENU_WIDTH = 220
const VIEWPORT_MARGIN = 8

type RecordRowContextMenuProps = {
  record: VaultRecord
  isOpen: boolean
  position: { x: number; y: number }
  onOpenChange: (open: boolean) => void
  onSelectItem: () => void
}

type RecordAction = {
  type: string
  click: () => void
}

type FileBuffer = { id: string; name: string }

export const RecordRowContextMenu = ({
  record,
  isOpen,
  position,
  onOpenChange,
  onSelectItem
}: RecordRowContextMenuProps) => {
  const { theme } = useTheme()
  const { setModal } = useModal()
  const { actions } = useRecordActionItems({ record }) as {
    actions: RecordAction[]
  }
  const { createRecord } = useCreateRecord()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const favoriteAction = actions.find((a) => a.type === 'favorite')

  const handleEdit = () => {
    close()
    handleCreateOrEditRecord({
      recordType: record.type,
      initialRecord: record
    })
  }

  const handleFavorite = () => {
    close()
    favoriteAction?.click()
  }

  const handleSelect = () => {
    close()
    onSelectItem()
  }

  const handleMove = () => {
    close()
    setModal(<MoveFolderModalContentV2 records={[record]} />)
  }

  const fetchFileBuffers = async (files: FileBuffer[] | undefined) =>
    Promise.all(
      (files ?? []).map(async ({ id, name }) => {
        const buffer = await vaultGetFile(`record/${record.id}/file/${id}`)
        return { name, buffer }
      })
    )

  const handleDuplicate = async () => {
    close()
    const data: Record<string, unknown> = { ...(record.data ?? {}) }
    data.attachments = await fetchFileBuffers(
      record.data?.attachments as FileBuffer[] | undefined
    )
    if (record.type === 'identity') {
      data.passportPicture = await fetchFileBuffers(
        record.data?.passportPicture as FileBuffer[] | undefined
      )
      data.idCardPicture = await fetchFileBuffers(
        record.data?.idCardPicture as FileBuffer[] | undefined
      )
      data.drivingLicensePicture = await fetchFileBuffers(
        record.data?.drivingLicensePicture as FileBuffer[] | undefined
      )
    }
    await createRecord({
      type: record.type,
      folder: record.folder,
      isFavorite: record.isFavorite,
      data
    })
  }

  const handleDelete = () => {
    close()
    setModal(<DeleteRecordsModalContentV2 records={[record]} />)
  }

  const menuRef = useRef<HTMLDivElement>(null)
  // null until measured — keeps the menu hidden to avoid a one-frame flash.
  const [coords, setCoords] = useState<{
    top: number
    left: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null)
      return
    }
    const el = menuRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportWidth =
      typeof window !== 'undefined' ? window.innerWidth : Infinity
    const viewportHeight =
      typeof window !== 'undefined' ? window.innerHeight : Infinity

    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      viewportWidth - rect.width - VIEWPORT_MARGIN
    )
    const left = Math.min(Math.max(position.x, VIEWPORT_MARGIN), maxLeft)

    const fitsBelow =
      position.y + rect.height <= viewportHeight - VIEWPORT_MARGIN
    const top = fitsBelow
      ? position.y
      : Math.max(VIEWPORT_MARGIN, position.y - rect.height)

    setCoords({ top, left })
  }, [isOpen, position.x, position.y])

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (!isOpen || typeof document === 'undefined') return null

  const iconPrimary = theme.colors.colorTextPrimary
  const iconDestructive = theme.colors.colorTextDestructive

  const visibility = coords === null ? 'hidden' : 'visible'
  const top = coords?.top ?? position.y
  const left = coords?.left ?? position.x

  return createPortal(
    <>
      <div
        onClick={close}
        onContextMenu={(event) => event.preventDefault()}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'transparent',
          zIndex: 999
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        data-testid={`record-row-menu-${record.id}`}
        onClick={close}
        style={{
          position: 'fixed',
          top,
          left,
          width: RECORD_ROW_CONTEXT_MENU_WIDTH,
          visibility,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
          backgroundColor: theme.colors.colorSurfacePrimary,
          border: `1px solid ${theme.colors.colorBorderPrimary}`,
          borderRadius: 8,
          paddingBlock: 4,
          paddingInline: 4,
          zIndex: 1000,
          boxSizing: 'border-box',
          boxShadow: rawTokens.shadowMenu
        }}
      >
        <NavbarListItem
          size="small"
          icon={<EditOutlined color={iconPrimary} />}
          label={t`Edit`}
          testID={`record-row-menu-edit-${record.id}`}
          onClick={handleEdit}
        />
        <NavbarListItem
          size="small"
          icon={<StarOutlined color={iconPrimary} />}
          label={
            record.isFavorite ? t`Remove from Favorites` : t`Add to Favorites`
          }
          testID={`record-row-menu-favorite-${record.id}`}
          onClick={handleFavorite}
        />
        <NavbarListItem
          size="small"
          icon={<CheckBox color={iconPrimary} />}
          label={t`Select Item`}
          testID={`record-row-menu-select-${record.id}`}
          onClick={handleSelect}
        />
        {UNSUPPORTED && (
          <NavbarListItem
            size="small"
            icon={<Share color={iconPrimary} />}
            label={t`Share Item`}
            testID={`record-row-menu-share-${record.id}`}
            onClick={close}
          />
        )}
        <NavbarListItem
          size="small"
          icon={<DriveFileMoveOutlined color={iconPrimary} />}
          label={t`Move to Another Folder`}
          testID={`record-row-menu-move-${record.id}`}
          onClick={handleMove}
        />
        <NavbarListItem
          size="small"
          icon={<CopyAll color={iconPrimary} />}
          label={t`Duplicate`}
          testID={`record-row-menu-duplicate-${record.id}`}
          onClick={() => {
            void handleDuplicate()
          }}
        />
        <div
          style={{
            width: '100%',
            height: 1,
            backgroundColor: theme.colors.colorBorderPrimary
          }}
          role="separator"
          aria-hidden="true"
        />
        <NavbarListItem
          size="small"
          variant="destructive"
          icon={<TrashOutlined color={iconDestructive} />}
          label={t`Delete Item`}
          testID={`record-row-menu-delete-${record.id}`}
          onClick={handleDelete}
        />
      </div>
    </>,
    document.body
  )
}
