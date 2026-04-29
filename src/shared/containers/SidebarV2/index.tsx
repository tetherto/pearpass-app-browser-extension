import type { MouseEvent } from 'react'
import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  closeAllInstances,
  useFolders,
  useRecordCountsByType,
  useVault,
  useVaults
} from '@tetherto/pearpass-lib-vault'
import {
  Button,
  ContextMenu,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Pressable } from '@tetherto/pearpass-lib-ui-kit/components/Pressable'
import {
  Close,
  CreateNewFolder,
  EditOutlined,
  ExpandMore,
  Folder,
  FolderCopy,
  LockFilled,
  LockOutlined,
  SettingsOutlined,
  StarBorder,
  StarFilled,
  TrashOutlined,
  TwoFactorAuthenticationOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import {
  createStyles,
  FOLDER_CONTEXT_MENU_WIDTH,
  FOLDERS_CHEVRON_CENTER_SHIFT_PX
} from './SidebarV2.styles'
import { VaultSelector } from './VaultSelector'
import { NAVIGATION_ROUTES } from '../../constants/navigation'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { useRecordMenuItemsV2 } from '../../hooks/useRecordMenuItemsV2'
import { sortByName } from '../../utils/sortByName'
import { CreateFolderModalContentV2 } from '../CreateFolderModalContentV2'
import { DeleteFolderModalContent } from '../DeleteFolderModalContent'

const FAVORITES_FOLDER_ID = 'favorites'

export const SidebarV2 = () => {
  const { theme } = useTheme()
  const { isSidebarCollapsed: isCollapsed } = useAppHeaderContext()
  const [isVaultSelectorOpen, setIsVaultSelectorOpen] = useState(false)
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true)
  const [openFolderMenu, setOpenFolderMenu] = useState<string | null>(null)
  const styles = createStyles(theme.colors, isCollapsed)

  const { navigate, state: routerState } = useRouter() as {
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
    state: { recordType?: string; folder?: string } | undefined
  }
  const { data: vaultData } = useVault()
  const { data: foldersData, deleteFolder } = useFolders()
  const { data: recordCounts } = useRecordCountsByType()
  const { resetState } = useVaults()
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()

  const { categoriesItems } = useRecordMenuItemsV2()

  const activeCategory = routerState?.recordType ?? null
  const isFavoritesActive = routerState?.folder === FAVORITES_FOLDER_ID
  const selectedFolderName =
    routerState?.folder && !isFavoritesActive ? routerState.folder : null
  const currentRecordType = routerState?.recordType ?? 'all'
  const currentFolder = routerState?.folder
  const isAllFoldersActive = !routerState?.folder

  const customFolders = useMemo(() => {
    const raw = Object.values(foldersData?.customFolders ?? {})
    return sortByName(
      raw.map((folder) => ({
        name: folder.name,
        count: folder.records.filter((record) => !!record.data).length
      }))
    )
  }, [foldersData])

  const favoritesCount =
    (foldersData?.favorites?.records?.length as number | undefined) ?? 0

  const handleCategoryClick = (type: string) => {
    navigate('vault', {
      state: {
        recordType: type,
        folder: currentFolder
      }
    })
  }

  const handleFolderClick = (folderId: string) => {
    navigate('vault', {
      state: { recordType: currentRecordType, folder: folderId }
    })
  }

  const handleAllFoldersClick = () => {
    navigate('vault', { state: { recordType: currentRecordType } })
  }

  const handleAddFolderClick = () => {
    setModal(<CreateFolderModalContentV2 onClose={closeModal} />)
  }

  const handleRenameFolder = (folderName: string) => {
    setModal(
      <CreateFolderModalContentV2
        initialValues={{ title: folderName }}
        onClose={closeModal}
        onRename={(newName, previousName) => {
          if (routerState?.folder === previousName) {
            navigate('vault', {
              state: { recordType: currentRecordType, folder: newName }
            })
          }
        }}
      />
    )
  }

  const handleAuthenticatorClick = () => {
    navigate('authenticator', { params: {} })
  }

  const handleSettingsClick = () => {
    navigate('settings', { params: {} })
  }

  const handleLockApp = async () => {
    setIsLoading(true)
    try {
      await closeAllInstances()
      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
      resetState()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFolder = (folderName: string, count: number) => {
    if (count === 0) {
      void deleteFolder(folderName)
      if (routerState?.folder === folderName) {
        navigate('vault', { state: { recordType: currentRecordType } })
      }
      return
    }
    setModal(
      <DeleteFolderModalContent
        folderName={folderName}
        count={count}
        onClose={closeModal}
      />
    )
  }

  const iconTextPrimary = { color: theme.colors.colorTextPrimary }
  const iconTextSecondary = { color: theme.colors.colorTextSecondary }

  const renderVaultHeader = () => {
    const chevronStyle = {
      ...iconTextPrimary,
      ...styles.chevron,
      ...(isVaultSelectorOpen ? styles.chevronFlipped : {})
    }

    const showCloseButton = !isCollapsed && isVaultSelectorOpen

    return (
      <div style={styles.vaultSelector} data-testid="sidebar-vault-selector">
        <div style={isCollapsed ? styles.vaultIconHidden : undefined}>
          <LockFilled width={16} height={16} style={iconTextPrimary} />
        </div>
        <div
          style={{
            ...styles.vaultNameGroup,
            ...(isCollapsed ? styles.vaultNameGroupHidden : {})
          }}
        >
          <Pressable
            onClick={() => setIsVaultSelectorOpen((value) => !value)}
            data-testid="sidebar-vault-selector-toggle"
            aria-label={
              isVaultSelectorOpen
                ? t`Close vault selector`
                : t`Open vault selector`
            }
          >
            <div style={styles.vaultNameRow}>
              <div style={styles.vaultNameText}>
                <Text variant="labelEmphasized" numberOfLines={1}>
                  {vaultData?.name ?? t`Personal Vault`}
                </Text>
              </div>
              <ExpandMore width={16} height={16} style={chevronStyle} />
            </div>
          </Pressable>
        </div>
        {showCloseButton && (
          <Button
            variant="tertiary"
            size="small"
            onClick={() => setIsVaultSelectorOpen(false)}
            data-testid="sidebar-vault-selector-close"
            aria-label={t`Close vault selector`}
            iconBefore={<Close style={iconTextPrimary} />}
          />
        )}
      </div>
    )
  }

  return (
    <aside style={styles.wrapper} data-testid="sidebar-v2">
      {renderVaultHeader()}

      <div style={styles.scrollContainer}>
        <div style={styles.scrollArea}>
          {isVaultSelectorOpen && <VaultSelector />}

          {!isVaultSelectorOpen && (
            <>
              <div style={styles.sectionList}>
                {categoriesItems.map((item) => {
                  const selected = activeCategory === item.type
                  const Icon = selected ? item.FilledIcon : item.OutlinedIcon
                  const iconColor = selected
                    ? theme.colors.colorTextPrimary
                    : theme.colors.colorTextSecondary

                  return (
                    <NavbarListItem
                      key={item.type}
                      testID={`sidebar-category-${item.type}`}
                      label={item.label}
                      count={
                        isCollapsed
                          ? undefined
                          : (recordCounts?.[item.type] ?? 0)
                      }
                      selected={selected}
                      variant={selected ? 'default' : 'secondary'}
                      size="small"
                      icon={<Icon color={iconColor} />}
                      onClick={() => handleCategoryClick(item.type)}
                    />
                  )
                })}
              </div>

              <hr style={styles.divider} />

              <div style={styles.sectionList}>
                <div style={styles.foldersHeader}>
                  <div style={styles.foldersHeaderToggle}>
                    <Pressable
                      onClick={() => setIsFoldersExpanded((value) => !value)}
                      data-testid="sidebar-folders-toggle"
                      aria-label={t`Folders`}
                    >
                      <div style={styles.foldersHeaderToggleInner}>
                        <ExpandMore
                          width={16}
                          height={16}
                          style={{
                            ...iconTextSecondary,
                            ...styles.chevron,
                            transform: `translateX(${
                              isCollapsed ? FOLDERS_CHEVRON_CENTER_SHIFT_PX : 0
                            }px) rotate(${!isFoldersExpanded ? -90 : 0}deg)`
                          }}
                        />
                        <div style={styles.foldersHeaderLabel}>
                          <Text
                            variant="labelEmphasized"
                            color={theme.colors.colorTextSecondary}
                          >
                            {t`Folders`}
                          </Text>
                        </div>
                      </div>
                    </Pressable>
                  </div>

                  {!isCollapsed && (
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={handleAddFolderClick}
                      data-testid="sidebar-folder-add"
                      aria-label={t`Add folder`}
                      iconBefore={<CreateNewFolder style={iconTextSecondary} />}
                    />
                  )}
                </div>

                {isFoldersExpanded && (
                  <>
                    <NavbarListItem
                      testID="sidebar-folder-all"
                      label={t`All Folders`}
                      count={isCollapsed ? undefined : (recordCounts?.all ?? 0)}
                      selected={isAllFoldersActive}
                      variant={isAllFoldersActive ? 'default' : 'secondary'}
                      size="small"
                      icon={
                        <FolderCopy
                          color={
                            isAllFoldersActive
                              ? theme.colors.colorTextPrimary
                              : theme.colors.colorTextSecondary
                          }
                        />
                      }
                      onClick={handleAllFoldersClick}
                    />

                    <NavbarListItem
                      testID="sidebar-folder-favorites"
                      label={t`Favorites`}
                      count={isCollapsed ? undefined : favoritesCount}
                      selected={isFavoritesActive}
                      variant={isFavoritesActive ? 'default' : 'secondary'}
                      size="small"
                      icon={
                        isFavoritesActive ? (
                          <StarFilled color={theme.colors.colorTextPrimary} />
                        ) : (
                          <StarBorder color={theme.colors.colorTextSecondary} />
                        )
                      }
                      onClick={() => handleFolderClick(FAVORITES_FOLDER_ID)}
                    />

                    {customFolders.map((folder) => (
                      <FolderRow
                        key={folder.name}
                        folder={folder}
                        selected={selectedFolderName === folder.name}
                        isCollapsed={isCollapsed}
                        menuOpen={openFolderMenu === folder.name}
                        onMenuOpenChange={(open) =>
                          setOpenFolderMenu(open ? folder.name : null)
                        }
                        styles={styles}
                        theme={theme}
                        onSelect={handleFolderClick}
                        onRename={handleRenameFolder}
                        onDelete={handleDeleteFolder}
                      />
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div style={styles.fadeGradient} aria-hidden="true" />
      </div>

      {AUTHENTICATOR_ENABLED && (
        <div style={styles.footerSection}>
          <NavbarListItem
            testID="sidebar-authenticator"
            label={t`Authenticator`}
            size="small"
            variant="default"
            icon={
              <TwoFactorAuthenticationOutlined
                color={theme.colors.colorTextPrimary}
              />
            }
            onClick={handleAuthenticatorClick}
          />
        </div>
      )}

      <div style={styles.footerSection}>
        <NavbarListItem
          testID="sidebar-settings-button"
          label={t`Settings`}
          size="small"
          variant="default"
          icon={<SettingsOutlined color={theme.colors.colorTextPrimary} />}
          onClick={handleSettingsClick}
        />
        <NavbarListItem
          testID="sidebar-lock-app"
          label={t`Lock App`}
          size="small"
          variant="default"
          icon={<LockOutlined color={theme.colors.colorTextPrimary} />}
          onClick={handleLockApp}
        />
      </div>
    </aside>
  )
}

type FolderRowProps = {
  folder: { name: string; count: number }
  selected: boolean
  isCollapsed: boolean
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
  styles: ReturnType<typeof createStyles>
  theme: ReturnType<typeof useTheme>['theme']
  onSelect: (folderName: string) => void
  onRename: (folderName: string) => void
  onDelete: (folderName: string, count: number) => void
}

const FolderRow = ({
  folder,
  selected,
  isCollapsed,
  menuOpen,
  onMenuOpenChange,
  styles,
  theme,
  onSelect,
  onRename,
  onDelete
}: FolderRowProps) => {
  const iconColor = selected
    ? theme.colors.colorTextPrimary
    : theme.colors.colorTextSecondary

  const withMenuClose = (handler: () => void) => () => {
    onMenuOpenChange(false)
    handler()
  }

  return (
    <div style={styles.folderRow}>
      <NavbarListItem
        testID={`sidebar-folder-${folder.name}`}
        label={folder.name}
        count={isCollapsed ? undefined : folder.count}
        selected={selected}
        variant={selected ? 'default' : 'secondary'}
        size="small"
        icon={<Folder color={iconColor} />}
        onClick={() => onSelect(folder.name)}
        onContextMenu={(e: MouseEvent) => {
          e.preventDefault()
          onMenuOpenChange(true)
        }}
      />
      <div style={styles.folderRowMenuAnchor}>
        <ContextMenu
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          menuWidth={FOLDER_CONTEXT_MENU_WIDTH}
          testID={`sidebar-folder-menu-${folder.name}`}
          trigger={<span style={styles.folderRowMenuTrigger} />}
        >
          <NavbarListItem
            size="small"
            icon={<EditOutlined color={theme.colors.colorTextPrimary} />}
            label={t`Rename Folder`}
            testID={`sidebar-folder-menu-rename-${folder.name}`}
            onClick={withMenuClose(() => onRename(folder.name))}
          />
          <NavbarListItem
            size="small"
            variant="destructive"
            icon={
              <TrashOutlined
                color={theme.colors.colorSurfaceDestructiveElevated}
              />
            }
            label={t`Delete Folder`}
            testID={`sidebar-folder-menu-delete-${folder.name}`}
            onClick={withMenuClose(() => onDelete(folder.name, folder.count))}
          />
        </ContextMenu>
      </div>
    </div>
  )
}
