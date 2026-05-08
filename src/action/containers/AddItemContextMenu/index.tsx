import type { ComponentType, ReactNode, SVGProps } from 'react'

import { t } from '@lingui/core/macro'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  ContextMenu,
  NavbarListItem,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Key, QrCode } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useRecordMenuItemsV2 } from '../../../shared/hooks/useRecordMenuItemsV2'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

const ADD_MENU_WIDTH = 220
const PASSWORD_TYPE = '__password__'

type AddMenuItem = {
  type: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

type AddItemContextMenuProps = {
  trigger: ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedFolder?: string
  isFavoritesView?: boolean
  testID?: string
}

export const AddItemContextMenu = ({
  trigger,
  isOpen,
  onOpenChange,
  selectedFolder,
  isFavoritesView = false,
  testID = 'add-item-context-menu'
}: AddItemContextMenuProps) => {
  const { theme } = useTheme()
  const { defaultItems } = useRecordMenuItemsV2()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const passwordItem: AddMenuItem = {
    type: PASSWORD_TYPE,
    label: t`Password`,
    Icon: Key
  }

  const authenticatorItem: AddMenuItem = {
    type: RECORD_TYPES.OTP,
    label: t`Authenticator Code`,
    Icon: QrCode
  }

  const handleSelectType = (type: string) => {
    onOpenChange(false)

    if (type === PASSWORD_TYPE) {
      handleCreateOrEditRecord({ recordType: 'password' })
      return
    }

    handleCreateOrEditRecord({
      recordType: type,
      selectedFolder,
      isFavorite: isFavoritesView || undefined,
      mode: type === RECORD_TYPES.OTP ? 'authenticator' : undefined
    })
  }

  const renderMenuItem = (item: AddMenuItem) => (
    <NavbarListItem
      key={item.type}
      size="small"
      label={item.label}
      testID={`add-menu-${item.type}`}
      icon={<item.Icon color={theme.colors.colorTextPrimary} />}
      onClick={() => handleSelectType(item.type)}
    />
  )

  return (
    <ContextMenu
      open={isOpen}
      onOpenChange={onOpenChange}
      menuWidth={ADD_MENU_WIDTH}
      testID={testID}
      trigger={trigger}
    >
      {defaultItems.map((item) =>
        renderMenuItem({
          type: item.type,
          label: item.label,
          Icon: item.OutlinedIcon
        })
      )}
      {renderMenuItem(passwordItem)}
      {AUTHENTICATOR_ENABLED && (
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
}
