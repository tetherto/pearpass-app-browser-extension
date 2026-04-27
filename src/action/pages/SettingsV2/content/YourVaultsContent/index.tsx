import { useCallback, useMemo } from 'react'

import { plural, t } from '@lingui/core/macro'
import {
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  Devices,
  Edit,
  LockOutlined,
  MoreVert,
  PersonAdd
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  useVault,
  useVaults,
  useRecords,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import type { ReactNode } from 'react'

import { AddDeviceModalContent } from '../../../../../shared/containers/AddDeviceModalContent'
import { CreateOrEditVaultModalContentV2 } from '../../../../../shared/containers/CreateOrEditVaultModalContentV2'
import { PairedDevicesModalContent } from '../../../../../shared/containers/PairedDevicesModalContent'
import { useModal } from '../../../../../shared/context/ModalContext'
import { sortByName } from '../../../../../shared/utils/sortByName'

const VAULT_ICON_BG = { backgroundColor: 'rgba(176, 217, 68, 0.18)' }

export const YourVaultsContent = () => {
  const { setModal, closeModal } = useModal() as {
    setModal: (content: ReactNode, params?: object) => void
    closeModal: () => Promise<void>
  }
  const { theme } = useTheme()

  const { data: vault } = useVault()
  const { data: allVaults } = useVaults()

  const { data: records } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: '',
        type: undefined,
        folder: undefined,
        isFavorite: undefined
      },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  })

  const itemCount = records?.length ?? 0

  const otherVaults = useMemo(() => {
    if (!allVaults || !vault) return []
    return sortByName(allVaults.filter((v: Vault) => v.id !== vault.id))
  }, [allVaults, vault])

  const openAddDeviceModal = useCallback(() => {
    setModal(<AddDeviceModalContent />)
  }, [setModal])

  const openDevicesModal = useCallback(() => {
    setModal(<PairedDevicesModalContent />)
  }, [setModal])

  const openCreateModal = useCallback(() => {
    setModal(
      <CreateOrEditVaultModalContentV2
        onClose={closeModal}
        onSuccess={closeModal}
      />
    )
  }, [closeModal, setModal])

  const openEditModal = useCallback(
    (v: Vault) => {
      setModal(
        <CreateOrEditVaultModalContentV2
          onClose={closeModal}
          onSuccess={closeModal}
          vault={v}
        />
      )
    },
    [closeModal, setModal]
  )

  const itemCountLabel = plural(itemCount, { one: '# Item', other: '# Items' })

  const devicesMeta = vault?.devices?.length
    ? plural(vault.devices.length, { one: '# Device', other: '# Devices' })
    : t`Private`

  if (!vault) {
    return null
  }

  return (
    <div
      className="box-border flex min-h-0 w-full flex-1 flex-col items-stretch gap-[24px]"
      data-testid="settings-card-your-vault"
    >
      <div className="flex flex-col gap-[8px]">
        <PageHeader
          as="h1"
          testID="settings-vault"
          title={t`Your Vaults`}
          subtitle={t`Manage your vaults, control access permissions, and take protective measures if needed.`}
        />
      </div>

      <div className="flex flex-col gap-[12px]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Current Vault`}
        </Text>
        <div className="bg-surface-primary border-border-primary flex flex-col overflow-visible rounded-[8px] border">
          <ListItem
            subtitleLayout="horizontal"
            testID="settings-vault-item"
            title={vault.name}
            subtitle={{ primary: itemCountLabel, secondary: devicesMeta }}
            icon={
              <div
                className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px]"
                style={VAULT_ICON_BG}
              >
                <LockOutlined
                  color={theme.colors.colorPrimary}
                  width={16}
                  height={16}
                />
              </div>
            }
            rightElement={
              <div
                className="flex shrink-0 flex-row items-center gap-[4px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="tertiary"
                  size="small"
                  aria-label={t`Invite members`}
                  data-testid="settings-vault-invite-button"
                  onClick={openAddDeviceModal}
                  iconBefore={
                    <PersonAdd color={theme.colors.colorTextPrimary} />
                  }
                />
                <ContextMenu
                  testID="settings-vault-context-menu"
                  menuWidth={200}
                  trigger={
                    <Button
                      variant="tertiary"
                      size="small"
                      aria-label={t`Vault actions`}
                      data-testid="settings-vault-more-button"
                      iconBefore={
                        <MoreVert color={theme.colors.colorTextPrimary} />
                      }
                    />
                  }
                >
                  <NavbarListItem
                    testID="settings-vault-edit-button"
                    variant="secondary"
                    size="small"
                    label={t`Rename Vault`}
                    icon={
                      <Edit
                        color={theme.colors.colorTextPrimary}
                        width={24}
                        height={24}
                      />
                    }
                    onClick={() => openEditModal(vault)}
                  />
                  <NavbarListItem
                    testID="settings-vault-devices-button"
                    variant="secondary"
                    size="small"
                    label={t`View Paired Devices`}
                    icon={
                      <Devices
                        color={theme.colors.colorTextPrimary}
                        width={24}
                        height={24}
                      />
                    }
                    onClick={openDevicesModal}
                  />
                </ContextMenu>
              </div>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Other Vaults`}
        </Text>
        <div className="bg-surface-primary border-border-primary flex flex-col overflow-hidden rounded-[8px] border">
          {otherVaults.map((v: Vault, index: number) => (
            <div
              key={v.id}
              className={
                index < otherVaults.length - 1
                  ? 'border-border-primary border-b'
                  : ''
              }
            >
              <ListItem
                testID={`settings-other-vault-${v.name}-${index}`}
                title={v.name}
                showDivider={index == otherVaults.length - 1}
                icon={
                  <div
                    className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px]"
                    style={VAULT_ICON_BG}
                  >
                    <LockOutlined
                      color={theme.colors.colorPrimary}
                      width={16}
                      height={16}
                    />
                  </div>
                }
              />
            </div>
          ))}
          <div className="px-[4px] py-[4px]">
            <Button
              variant="tertiary"
              size="small"
              data-testid="settings-your-vaults-create"
              iconBefore={<Add color={theme.colors.colorPrimary} />}
              onClick={openCreateModal}
            >
              {t`Create New Vault`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
