import type { ComponentType, SVGProps } from 'react'

import { t } from '@lingui/core/macro'
import {
  AUTHENTICATOR_ENABLED,
  UNSUPPORTED
} from '@tetherto/pearpass-lib-constants'
import {
  ContextMenu,
  NavbarListItem,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Key,
  TwoFactorAuthenticationOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { AppHeaderAddItemTrigger, AppHeaderV2 } from '../AppHeaderV2'
import { ImportItemOrVaultModalContentV2 } from '../../../shared/containers/ImportItemOrVaultModalContentV2'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { useAppHeaderContext } from '../../../shared/context/AppHeaderContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { useRecordMenuItemsV2 } from '../../../shared/hooks/useRecordMenuItemsV2'
import { isFavorite } from '../../../shared/utils/isFavorite'

const ADD_MENU_WIDTH = 220

const PASSWORD_TYPE = '__password__'
const AUTHENTICATOR_CODE_TYPE = '__authenticator__'

type AddMenuExtraItem = {
  type: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const AppHeaderContainer = () => {
  const { theme } = useTheme()
  const {
    currentPage,
    state: routerState,
    navigate
  } = useRouter() as {
    currentPage: string
    state: { recordType?: string; folder?: string } | undefined
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
  }
  const {
    searchValue,
    setSearchValue,
    isAddMenuOpen,
    setIsAddMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useAppHeaderContext()
  const { defaultItems } = useRecordMenuItemsV2()
  const { setModal, closeModal } = useModal()
  const { setToast } = useToast() as {
    setToast: (toast: { message: string }) => void
  }
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({ message: t`Copied to clipboard` })
    }
  }) as {
    copyToClipboard: (text: string) => boolean
  }

  const handlePasswordCopy = (value: string) => {
    copyToClipboard(value)
    closeModal()
  }

  if (currentPage !== 'vault') {
    return null
  }

  if (AUTHENTICATOR_ENABLED && routerState?.recordType === 'authenticator') {
    return null
  }

  const isFavoritesView = isFavorite(routerState?.folder ?? '')
  const selectedFolder =
    routerState?.folder && !isFavoritesView ? routerState.folder : undefined

  const passwordItem: AddMenuExtraItem = {
    type: PASSWORD_TYPE,
    label: t`Password`,
    Icon: Key
  }

  const authenticatorItem: AddMenuExtraItem = {
    type: AUTHENTICATOR_CODE_TYPE,
    label: t`Authenticator Code`,
    Icon: TwoFactorAuthenticationOutlined
  }

  const handleSelectType = (type: string) => {
    setIsAddMenuOpen(false)

    if (type === PASSWORD_TYPE) {
      setModal(
        <PasswordGeneratorModalContent
          actionLabel={t`Copy and close`}
          onActionClick={handlePasswordCopy}
          onClose={closeModal}
        />
      )
      return
    }

    if (type === AUTHENTICATOR_CODE_TYPE) {
      navigate('authenticator', { params: {} })
      return
    }

    navigate('createOrEditCategory', {
      params: {
        recordType: type,
        ...(selectedFolder ? { folder: selectedFolder } : {}),
        ...(isFavoritesView ? { isFavorite: true } : {})
      }
    })
  }

  const handleImportClick = () => {
    setModal(<ImportItemOrVaultModalContentV2 />)
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((value) => !value)
  }

  const renderMenuItem = (item: {
    type: string
    label: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
  }) => (
    <NavbarListItem
      key={item.type}
      size="small"
      label={item.label}
      testID={`add-menu-${item.type}`}
      icon={<item.Icon color={theme.colors.colorTextPrimary} />}
      onClick={() => handleSelectType(item.type)}
    />
  )

  const addItemControl = (
    <ContextMenu
      open={isAddMenuOpen}
      onOpenChange={setIsAddMenuOpen}
      menuWidth={ADD_MENU_WIDTH}
      testID="app-header-add-menu"
      trigger={
        <AppHeaderAddItemTrigger
          testID="main-plus-button"
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
        />
      }
    >
      {defaultItems.map((item) =>
        renderMenuItem({
          type: item.type,
          label: item.label,
          Icon: item.OutlinedIcon
        })
      )}
      {renderMenuItem(passwordItem)}
      {UNSUPPORTED && (
        <>
          <div
            style={{
              height: 1,
              backgroundColor: theme.colors.colorBorderPrimary,
              margin: 0
            }}
            role="separator"
            aria-hidden="true"
          />
          {renderMenuItem(authenticatorItem)}
        </>
      )}
    </ContextMenu>
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
