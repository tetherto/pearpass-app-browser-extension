import { useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { colors } from 'pearpass-lib-ui-theme-provider'
import {
  closeAllInstances,
  useFolders,
  useVault,
  useVaults
} from 'pearpass-lib-vault'

import { ButtonPrimary } from '../../components/ButtonPrimary'
import { VaultActionsPopupContent } from '../../components/VaultActionsPopupContent'
import { NAVIGATION_ROUTES } from '../../constants/navigation'
import { ConfirmationModalContent } from '../../containers/ConfirmationModalContent'
import { CreateFolderModalContent } from '../../containers/CreateFolderModalContent'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { BrushIcon } from '../../icons/BrushIcon'
import { DeleteIcon } from '../../icons/DeleteIcon'
import { ExitIcon } from '../../icons/ExitIcon'
import { FolderIcon } from '../../icons/FolderIcon'
import { SettingsIcon } from '../../icons/SettingsIcon'
import { StarIcon } from '../../icons/StarIcon'
import { UserSecurityIcon } from '../../icons/UserSecurityIcon'
import { sortByName } from '../../utils/sortByName'
import { DropdownSwapVault } from '../DropdownSwapVault'
import { SidebarDropdown } from '../SidebarDropdown'

const TRANSITION_DURATION = 300

/**
 * @param {{
 *  isOpen: boolean,
 *  onClose: () => void,
 *  width?: string
 * }} props
 */
export const Sidebar = ({ isOpen, onClose, width = '280px' }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVaultDropdownOpen, setIsVaultDropdownOpen] = useState(false)
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(true)
  const { setModal, closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

  const { navigate, state } = useRouter()

  const { data, deleteFolder } = useFolders()

  const {
    data: vaultsData,
    resetState,
    refetch: refetchMasterVault
  } = useVaults()

  const { data: vaultData } = useVault()

  useEffect(() => {
    refetchMasterVault()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsMounted(false)
      }, TRANSITION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const vaults = useMemo(
    () => sortByName(vaultsData?.filter((vault) => vault.id !== vaultData?.id)),
    [vaultsData, vaultData]
  )

  const folders = useMemo(() => {
    const { customFolders } = data || {}

    const otherFolders = Object.values(customFolders ?? {})
      .map(({ name }) => ({
        label: name,
        id: name,
        icon: FolderIcon,
        showMenu: true
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    const allItemsFolder = {
      label: t`All Items`,
      id: 'allItems',
      showMenu: false
    }

    const favoritesFolder = {
      label: t`Favorites`,
      id: 'favorites',
      icon: StarIcon,
      showMenu: false
    }

    return [allItemsFolder, favoritesFolder, ...otherFolders]
  }, [data])

  const handleFolderClick = (folder) => {
    if (folder.id === 'allItems') {
      navigate('vault', { state: { recordType: 'all' } })
      onClose()
      return
    }

    navigate('vault', { state: { recordType: 'all', folder: folder.id } })
    onClose()
  }

  const selectedFolder = useMemo(() => {
    const currentFolder = state.folder || 'allItems'

    return folders.find((folder) => folder.id === currentFolder)
  }, [state, folders])

  const handleExit = async () => {
    setIsLoading(true)
    await closeAllInstances()
    setIsLoading(false)
    navigate('welcome', {
      params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
    })
    resetState()
  }

  const vaultActions = [
    {
      name: t`Delete Folder`,
      icon: DeleteIcon,
      onClick: (folder) => {
        setModal(
          <ConfirmationModalContent
            title={t`Are you sure to delete this Folder?`}
            text={t`This action will permanently delete the folder and all items contained within it. Are you sure you want to proceed?`}
            primaryLabel={t`No`}
            secondaryLabel={t`Yes`}
            secondaryAction={() => {
              deleteFolder(folder.id)
              closeModal()
            }}
            primaryAction={closeModal}
          />
        )
      }
    },
    {
      name: t`Rename Folder`,
      icon: BrushIcon,
      onClick: (folder) => {
        setModal(
          <CreateFolderModalContent initialValues={{ title: folder.id }} />
        )
      }
    }
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{
          opacity: isAnimating ? 0.5 : 0
        }}
        onClick={onClose}
      />

      <div
        className="bg-grey500-mode1 absolute top-0 bottom-0 left-0 flex h-full flex-col justify-between gap-2.5 overflow-hidden px-5 py-8 shadow-xl transition-transform duration-300"
        style={{
          width,
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
          <DropdownSwapVault
            vaults={vaults}
            selectedVault={vaultData}
            isOpen={isVaultDropdownOpen}
            setIsOpen={(open) => {
              setIsVaultDropdownOpen(open)
              if (open) setIsFolderDropdownOpen(false)
            }}
          />
          <SidebarDropdown
            renderMenuPopupContent={(folder) => (
              <VaultActionsPopupContent
                actions={vaultActions.map((action) => ({
                  ...action,
                  onClick: () => action.onClick(folder)
                }))}
              />
            )}
            onItemClick={handleFolderClick}
            items={folders}
            selectedItem={selectedFolder}
            isOpen={isFolderDropdownOpen}
            setIsOpen={(open) => {
              setIsFolderDropdownOpen(open)
              if (open) setIsVaultDropdownOpen(false)
            }}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              navigate('settings')
            }}
            className="text-white-mode1 bg-grey400-mode1 flex cursor-pointer items-center gap-1 rounded-[10px] px-[15px] py-[8px] text-[14px]"
          >
            <SettingsIcon size="24" color={colors.white.mode1} />
            {t`Settings`}
          </button>

          <ButtonPrimary
            onClick={() => {
              navigate('addDevice')
            }}
            className="justify-start"
            startIcon={UserSecurityIcon}
          >
            {t`Add Device`}
          </ButtonPrimary>

          <ButtonPrimary
            onClick={handleExit}
            className="justify-start"
            startIcon={ExitIcon}
          >
            {t`Exit Vault`}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  )
}
