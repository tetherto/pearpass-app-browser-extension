import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'

import { AddItemContextMenu } from '../AddItemContextMenu'
import { AppHeaderAddItemTrigger, AppHeaderV2 } from '../AppHeaderV2'
import { ImportItemOrVaultModalContentV2 } from '../../../shared/containers/ImportItemOrVaultModalContentV2'
import { useAppHeaderContext } from '../../../shared/context/AppHeaderContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { isFavorite } from '../../../shared/utils/isFavorite'

export const AppHeaderContainer = () => {
  const { currentPage, state: routerState } = useRouter() as {
    currentPage: string
    state: { recordType?: string; folder?: string } | undefined
  }
  const {
    searchValue,
    setSearchValue,
    isAddMenuOpen,
    setIsAddMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useAppHeaderContext()
  const { setModal } = useModal()

  if (
    currentPage !== 'vault' &&
    !(AUTHENTICATOR_ENABLED && currentPage === 'authenticator')
  ) {
    return null
  }

  const isFavoritesView = isFavorite(routerState?.folder ?? '')
  const selectedFolder =
    routerState?.folder && !isFavoritesView ? routerState.folder : undefined

  const handleImportClick = () => {
    setModal(<ImportItemOrVaultModalContentV2 />)
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((value) => !value)
  }

  const addItemControl = (
    <AddItemContextMenu
      isOpen={isAddMenuOpen}
      onOpenChange={setIsAddMenuOpen}
      selectedFolder={selectedFolder}
      isFavoritesView={isFavoritesView}
      testID="app-header-add-menu"
      trigger={
        <AppHeaderAddItemTrigger
          testID="main-plus-button"
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
        />
      }
    />
  )

  return (
    <AppHeaderV2
      searchValue={searchValue}
      onSearchChange={(val) => setSearchValue(val)}
      onImportClick={handleImportClick}
      onSidebarToggle={handleSidebarToggle}
      isSidebarCollapsed={isSidebarCollapsed}
      addItemControl={addItemControl}
      searchTestID="main-search-input"
      importTestID="main-import-button"
    />
  )
}
