import { useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useRecords } from 'pearpass-lib-vault'

import { BadgeCategory } from '../../../shared/components/BadgeCategory'
import { ButtonFilter } from '../../../shared/components/ButtonFilter'
import { ButtonPlusCreateNew } from '../../../shared/components/ButtonPlusCreateNew'
import { CreateNewCategoryPopupContent } from '../../../shared/components/CreateNewCategoryPopupContent'
import { InputSearch } from '../../../shared/components/InputSearch'
import { Menu, MenuTrigger } from '../../../shared/components/Menu'
import { RecordSortActionsPopupContent } from '../../../shared/components/RecordSortActionsPopupContent'
import { ConfirmationModalContent } from '../../../shared/containers/ConfirmationModalContent'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { Sidebar } from '../../../shared/containers/Sidebar'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { useRecordMenuItems } from '../../../shared/hooks/useRecordMenuItems'
import { ArrowUpAndDown } from '../../../shared/icons/ArrowUpAndDown'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { DeleteIcon } from '../../../shared/icons/DeleteIcon'
import { GroupIcon } from '../../../shared/icons/GroupIcon'
import { MultiSelectionIcon } from '../../../shared/icons/MultiSelectionIcon'
import { TimeIcon } from '../../../shared/icons/TimeIcon'
import { XIcon } from '../../../shared/icons/XIcon'
import { LogoLock } from '../../../shared/svgs/logoLock'
import { isFavorite } from '../../../shared/utils/isFavorite'
import { EmptyCollectionView } from '../../containers/EmptyCollectionView'
import { RecordListContainer } from '../../containers/RecordListContainer'
import { SyncData } from '../../containers/SyncData'

const SORT_BY_TYPE = {
  recent: {
    key: 'updatedAt',
    direction: 'desc'
  },
  newToOld: {
    key: 'createdAt',
    direction: 'desc'
  },
  oldToNew: {
    key: 'createdAt',
    direction: 'asc'
  }
}

export const RecordList = () => {
  const { navigate, state: routerState, currentPage } = useRouter()

  const [isCreateNewCategoryOpen, setIsCreateNewCategoryOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortType, setSortType] = useState('recent')
  const pendingDeleteIds = useRef([])

  const { popupItems, menuItems } = useRecordMenuItems()
  const { setModal, closeModal } = useModal()
  const { setToast } = useToast()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard`,
        icon: CopyIcon
      })
    }
  })

  const sort = useMemo(() => SORT_BY_TYPE[sortType], [sortType])

  const { data: records, deleteRecords } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: searchValue,
        type:
          routerState?.recordType === 'all'
            ? undefined
            : routerState?.recordType,
        folder: routerState?.folder,
        isFavorite: routerState?.folder
          ? isFavorite(routerState.folder)
          : undefined
      },
      sort: sort
    }
  })

  const sortActions = [
    { name: t`Recent`, icon: TimeIcon, type: 'recent' },
    {
      name: t`Newest to oldest`,
      icon: ArrowUpAndDown,
      type: 'newToOld'
    },
    { name: t`Oldest to newest`, icon: ArrowUpAndDown, type: 'oldToNew' }
  ]

  const selectedSortAction = sortActions.find(
    (action) => action.type === sortType
  )

  const handleSelect = (recordId, isSelected) => {
    setIsMultiSelect(true)

    setSelectedRecords((prev) =>
      isSelected
        ? prev.filter((selectedRecord) => selectedRecord !== recordId)
        : [...prev, recordId]
    )
  }

  const openRecordDetails = (recordId) => {
    navigate('recordDetails', {
      params: { recordId: recordId }
    })
  }

  const handleRecordClick = (recordId, isSelected) => {
    if (isMultiSelect) {
      handleSelect(recordId, isSelected)
      return
    }

    openRecordDetails(recordId)
  }

  const handleSortTypeChange = (type) => {
    setSortType(type)
  }

  const onClearSelection = () => {
    setSelectedRecords([])

    setIsMultiSelect(false)
  }

  // Close modal only if all records were successfully deleted
  useEffect(() => {
    if (pendingDeleteIds.current.length > 0 && records) {
      const remainingRecords = pendingDeleteIds.current.filter((id) =>
        records.some((r) => r.id === id)
      )

      if (remainingRecords?.length === 0) {
        closeModal()
        onClearSelection()
        pendingDeleteIds.current = []
      }
    }
  }, [records?.length, closeModal])

  const handleDeleteConfirm = async () => {
    pendingDeleteIds.current = [...selectedRecords]

    try {
      await deleteRecords(selectedRecords)
    } catch {
      pendingDeleteIds.current = []
    }
  }

  const handleDelete = () => {
    setModal(
      <ConfirmationModalContent
        title={t`Are you sure to delete this item?`}
        text={t`This is permanent and cannot be undone`}
        primaryLabel={t`No`}
        secondaryLabel={t`Yes`}
        secondaryAction={handleDeleteConfirm}
        primaryAction={closeModal}
      />
    )
  }

  const handleCopy = (value) => {
    copyToClipboard(value)
    closeModal()
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="bg-grey400-mode1 flex w-full flex-1 flex-col gap-3 overflow-auto px-6 pt-7">
        <div className="top-0 flex w-full items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(186,222,91,0.2)] px-2 py-1"
          >
            <LogoLock width="100%" height="100%" />
          </button>

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <InputSearch
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            quantity={records?.length}
            placeholder="Search..."
          />

          <Menu
            open={isCreateNewCategoryOpen}
            onOpenChange={setIsCreateNewCategoryOpen}
          >
            <MenuTrigger>
              <ButtonPlusCreateNew isOpen={isCreateNewCategoryOpen} />
            </MenuTrigger>
            <CreateNewCategoryPopupContent
              menuItems={popupItems}
              onClick={(item) => {
                if (item.type === 'password') {
                  setModal(
                    <PasswordGeneratorModalContent
                      actionLabel={t`Copy and close`}
                      onActionClick={handleCopy}
                      onClose={closeModal}
                    />,
                    {
                      fullScreen: true
                    }
                  )
                  return
                }

                navigate('createOrEditCategory', {
                  params: { recordType: item.type }
                })
              }}
            />
          </Menu>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[10px]">
            {isMultiSelect ? (
              <>
                <ButtonFilter
                  disabled={!selectedRecords?.length}
                  onClick={handleDelete}
                  startIcon={DeleteIcon}
                >
                  {t`Delete`}
                </ButtonFilter>
              </>
            ) : (
              <>
                <Menu>
                  <MenuTrigger>
                    <BadgeCategory
                      label={
                        menuItems.find(
                          (item) => item.type === routerState?.recordType
                        )?.name
                      }
                      type={routerState?.recordType}
                    />
                  </MenuTrigger>
                  <CreateNewCategoryPopupContent
                    menuItems={menuItems}
                    onClick={(item) => {
                      navigate(currentPage, {
                        state: { recordType: item.type }
                      })
                    }}
                  />
                </Menu>
                <Menu>
                  <MenuTrigger>
                    <ButtonFilter startIcon={GroupIcon}>
                      {selectedSortAction.name}
                    </ButtonFilter>
                  </MenuTrigger>
                  <RecordSortActionsPopupContent
                    onClick={handleSortTypeChange}
                    selectedType={sortType}
                    menuItems={sortActions}
                  />
                </Menu>
              </>
            )}
          </div>

          <div>
            {isMultiSelect ? (
              <ButtonFilter onClick={onClearSelection} startIcon={XIcon}>
                {t`Cancel`}
              </ButtonFilter>
            ) : (
              <ButtonFilter
                onClick={() => setIsMultiSelect(true)}
                startIcon={MultiSelectionIcon}
              >
                {t`Multiple selection`}
              </ButtonFilter>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {!records?.length ? (
            <EmptyCollectionView />
          ) : (
            <div className="flex-1 pb-16">
              <RecordListContainer
                records={records}
                onRecordClick={handleRecordClick}
                onRecordSelect={handleSelect}
                selectedRecords={selectedRecords}
              />
            </div>
          )}
        </div>
      </div>

      <SyncData />
    </div>
  )
}
