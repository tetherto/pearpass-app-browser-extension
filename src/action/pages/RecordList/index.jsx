import { useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  closeAllInstances,
  useFolders,
  useRecords,
  useVaults
} from 'pearpass-lib-vault'

import { BadgeCategory } from '../../../shared/components/BadgeCategory'
import { ButtonFilter } from '../../../shared/components/ButtonFilter'
import { ButtonPlusCreateNew } from '../../../shared/components/ButtonPlusCreateNew'
import { CreateNewCategoryPopupContent } from '../../../shared/components/CreateNewCategoryPopupContent'
import { InputSearch } from '../../../shared/components/InputSearch'
import { PopupMenu } from '../../../shared/components/PopupMenu'
import { RecordSortActionsPopupContent } from '../../../shared/components/RecordSortActionsPopupContent'
import { VaultActionsPopupContent } from '../../../shared/components/VaultActionsPopupContent'
import { NAVIGATION_ROUTES } from '../../../shared/constants/navigation'
import { ConfirmationModalContent } from '../../../shared/containers/ConfirmationModalContent'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { useLoadingContext } from '../../../shared/context/LoadingContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { useRecordMenuItems } from '../../../shared/hooks/useRecordMenuItems'
import { ArrowUpAndDown } from '../../../shared/icons/ArrowUpAndDown'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { DeleteIcon } from '../../../shared/icons/DeleteIcon'
import { GroupIcon } from '../../../shared/icons/GroupIcon'
import { LockCircleIcon } from '../../../shared/icons/LockCircleIcon'
import { LogoutIcon } from '../../../shared/icons/LogoutIcon'
import { MultiSelectionIcon } from '../../../shared/icons/MultiSelectionIcon'
import { SettingsIcon } from '../../../shared/icons/SettingsIcon'
import { TimeIcon } from '../../../shared/icons/TimeIcon'
import { UserSecurityIcon } from '../../../shared/icons/UserSecurityIcon'
import { XIcon } from '../../../shared/icons/XIcon'
import { LogoLock } from '../../../shared/svgs/logoLock'
import { isFavorite } from '../../../shared/utils/isFavorite'
import { EmptyCollectionView } from '../../containers/EmptyCollectionView'
import { FolderDropdown } from '../../containers/FolderDropDown'
import { SwapVaultModalContent } from '../../containers/Modal/SwapVaultModalContent'
import { RecordListContainer } from '../../containers/RecordListContainer'
import { SyncData } from '../../containers/SyncData'

const ALL = 'all'

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
  const { setIsLoading } = useLoadingContext()

  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [isCreateNewCategoryOpen, setIsCreateNewCategoryOpen] = useState(false)
  const [isVaultActionsOpen, setIsVaultActionsOpen] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [sortType, setSortType] = useState('recent')
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false)
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

  const { resetState } = useVaults()

  const sort = useMemo(() => SORT_BY_TYPE[sortType], [sortType])

  const { data: folders } = useFolders()

  const isCustomFolders = useMemo(() => {
    const foldersList = Object.values(folders?.customFolders ?? {})

    if (!foldersList.length) {
      return false
    }

    return true
  }, [folders, routerState?.folder])

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

  const vaultActions = [
    {
      name: t`Swap Vault`,
      icon: LockCircleIcon,
      onClick: () => {
        setIsVaultActionsOpen(false)
        setModal(<SwapVaultModalContent />)
      }
    },
    {
      name: t`Add Device`,
      icon: UserSecurityIcon,
      onClick: () => {
        navigate('addDevice')
      }
    },
    {
      name: t`Settings`,
      icon: SettingsIcon,
      onClick: () => {
        navigate('settings')
      }
    },
    {
      name: t`Exit Vault`,
      icon: LogoutIcon,
      onClick: async () => {
        setIsLoading(true)
        await closeAllInstances()
        setIsLoading(false)
        navigate('welcome', {
          params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
        })
        resetState()
      }
    }
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
          <PopupMenu
            side="right"
            align="right"
            isOpen={isVaultActionsOpen}
            setIsOpen={setIsVaultActionsOpen}
            content={<VaultActionsPopupContent actions={vaultActions} />}
          >
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(186,222,91,0.2)] px-2 py-1">
              <LogoLock width="100%" height="100%" />
            </div>
          </PopupMenu>

          <InputSearch
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            quantity={records?.length}
            placeholder="Search..."
          />

          <PopupMenu
            side="right"
            align="right"
            isOpen={isCreateNewCategoryOpen}
            setIsOpen={setIsCreateNewCategoryOpen}
            content={
              <CreateNewCategoryPopupContent
                menuItems={popupItems}
                onClick={(item) => {
                  if (item.type === 'password') {
                    setIsCreateNewCategoryOpen(false)
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
            }
          >
            <ButtonPlusCreateNew isOpen={isCreateNewCategoryOpen} />
          </PopupMenu>
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
                <PopupMenu
                  side="right"
                  align="right"
                  isOpen={isCategoryFilterOpen}
                  setIsOpen={setIsCategoryFilterOpen}
                  content={
                    <CreateNewCategoryPopupContent
                      menuItems={menuItems}
                      onClick={(item) => {
                        setIsCategoryFilterOpen(false)

                        navigate(currentPage, {
                          state: { recordType: item.type }
                        })
                      }}
                    />
                  }
                >
                  <BadgeCategory
                    label={
                      menuItems.find(
                        (item) => item.type === routerState?.recordType
                      )?.name
                    }
                    type={routerState?.recordType}
                  />
                </PopupMenu>
                <PopupMenu
                  side="left"
                  align="left"
                  isOpen={isSortPopupOpen}
                  setIsOpen={setIsSortPopupOpen}
                  content={
                    <RecordSortActionsPopupContent
                      onClick={handleSortTypeChange}
                      onClose={() => setIsSortPopupOpen(false)}
                      selectedType={sortType}
                      menuItems={sortActions}
                    />
                  }
                >
                  <ButtonFilter startIcon={GroupIcon}>
                    {selectedSortAction.name}
                  </ButtonFilter>
                </PopupMenu>
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

        {isCustomFolders && (
          <div>
            <FolderDropdown
              type="filter"
              selectedFolder={routerState?.folder}
              onFolderSelect={(item) => {
                navigate(currentPage, {
                  state: {
                    folder: item.type === ALL ? undefined : item.name,
                    recordType: routerState?.recordType
                  }
                })
              }}
            />
          </div>
        )}

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
