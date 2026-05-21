import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { EmptyCollectionView } from '../../containers/EmptyCollectionView'
import { EmptyResultsView } from '../../containers/EmptyResultsView'
import { MainViewHeader } from '../../containers/MainViewHeader'
import { MultiSelectActionsBar } from '../../containers/MultiSelectActionsBar'
import { RecordDetails } from '../../containers/RecordDetails/RecordDetails'
import { RecordListView } from '../../containers/RecordListView'
import {
  SORT_BY_TYPE,
  SORT_KEYS,
  type SortKey
} from '../../../shared/constants/sortOptions'
import { useAppHeaderContext } from '../../../shared/context/AppHeaderContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { DeleteRecordsModalContent } from '../../../shared/containers/DeleteRecordsModalContent'
import { MoveFolderModalContent } from '../../../shared/containers/MoveFolderModalContent'
import {
  groupRecordsByTimePeriod,
  type VaultRecord
} from '../../../shared/utils/groupRecordsByTimePeriod'
import { isFavorite } from '../../../shared/utils/isFavorite'

export const RecordList = () => {
  const { state: routerState } = useRouter() as {
    state: { recordType?: string; folder?: string } | undefined
  }
  const { setModal, isOpen: isModalOpen } = useModal()
  const { searchValue } = useAppHeaderContext()

  const { theme } = useTheme()
  const [sortKey, setSortKey] = useState<SortKey>(SORT_KEYS.LAST_UPDATED_NEWEST)
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  const isFavoritesView = isFavorite(routerState?.folder ?? '')
  const selectedFolder =
    routerState?.folder && !isFavoritesView ? routerState.folder : undefined

  const sort = useMemo(() => SORT_BY_TYPE[sortKey], [sortKey])

  const { data: records, updateFavoriteState } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: searchValue,
        type:
          routerState?.recordType === 'all'
            ? undefined
            : routerState?.recordType,
        folder: selectedFolder,
        isFavorite: isFavoritesView ? true : undefined
      },
      sort
    }
  }) as {
    data: VaultRecord[] | undefined
    updateFavoriteState: (ids: string[], isFavorite: boolean) => Promise<void>
  }

  const sections = useMemo(
    () => groupRecordsByTimePeriod(records ?? [], sort),
    [records, sort]
  )

  useEffect(() => {
    if (!isMultiSelectOn) setSelectedRecords([])
  }, [isMultiSelectOn])

  useEffect(() => {
    setIsMultiSelectOn(false)
    setSelectedRecordId(null)
  }, [routerState?.folder, routerState?.recordType, searchValue])

  useEffect(() => {
    if (isMultiSelectOn) setSelectedRecordId(null)
  }, [isMultiSelectOn])

  useEffect(() => {
    if (!selectedRecordId) return
    const stillExists = records?.some((r) => r.id === selectedRecordId)
    if (!stillExists) setSelectedRecordId(null)
  }, [records, selectedRecordId])

  const selectedRecordObjects = useMemo<VaultRecord[]>(() => {
    if (!records?.length || !selectedRecords.length) return []
    const ids = new Set(selectedRecords)
    return records.filter((record) => ids.has(record.id))
  }, [records, selectedRecords])

  const selectedCount = selectedRecordObjects.length
  const allSelectedFavorited =
    selectedCount > 0 && selectedRecordObjects.every((r) => !!r.isFavorite)

  const { data: foldersData } = useFolders()
  const hasCustomFolders =
    Object.keys(foldersData?.customFolders ?? {}).length > 0

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

  const handleMove = () => {
    if (!selectedCount) return
    setModal(
      <MoveFolderModalContent
        records={selectedRecordObjects}
        onCompleted={exitMultiSelect}
      />
    )
  }

  const handleDelete = () => {
    if (!selectedCount) return
    setModal(
      <DeleteRecordsModalContent
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

  const hasRecords = !!records?.length
  const hasDetailsPane = !!selectedRecordId && !isMultiSelectOn

  const listPane = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        minHeight: 0
      }}
    >
      <MainViewHeader
        sortKey={sortKey}
        setSortKey={setSortKey}
        isMultiSelectOn={isMultiSelectOn}
        setIsMultiSelectOn={setIsMultiSelectOn}
      />

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

      {hasRecords && (
        <RecordListView
          sections={sections}
          isMultiSelectOn={isMultiSelectOn}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setIsMultiSelectOn={setIsMultiSelectOn}
          selectedRecordId={selectedRecordId ?? undefined}
          onSelectRecord={(record) =>
            setSelectedRecordId((current) =>
              current === record.id ? null : record.id
            )
          }
        />
      )}

      {!hasRecords && !searchValue && (
        <EmptyCollectionView
          recordType={routerState?.recordType ?? 'all'}
          selectedFolder={selectedFolder}
          isFavoritesView={isFavoritesView}
        />
      )}
      {!hasRecords && !!searchValue && <EmptyResultsView />}
    </div>
  )

  if (hasDetailsPane) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          minHeight: 0
        }}
      >
        {listPane}
        <div
          style={{
            width: '1px',
            backgroundColor: theme.colors.colorBorderPrimary,
            flexShrink: 0
          }}
          role="separator"
          aria-hidden="true"
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            minHeight: 0
          }}
        >
          <RecordDetails
            recordId={selectedRecordId ?? undefined}
            onClose={() => setSelectedRecordId(null)}
          />
        </div>
      </div>
    )
  }

  return listPane
}
