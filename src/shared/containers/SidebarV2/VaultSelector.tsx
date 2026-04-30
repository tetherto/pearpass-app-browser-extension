import type { MouseEvent } from 'react'
import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  useInvite,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import {
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  EditOutlined,
  LockFilled,
  MoreVert,
  PersonAddAlt
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles, VAULT_ACTIONS_MENU_WIDTH } from './VaultSelector.styles'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { sortByName } from '../../utils/sortByName'
import { useVaultSwitch } from '../../hooks/useVaultSwitch'
import { CreateOrEditVaultModalContentV2 } from '../CreateOrEditVaultModalContentV2'
import { ShareVaultModalContentV2 } from '../ShareVaultModalContentV2'

export const VaultSelector = () => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()

  const { data: vaultsData } = useVaults()
  const { data: activeVault } = useVault()
  const { switchVault } = useVaultSwitch()
  const { data: inviteData, createInvite } = useInvite()

  const vaults = useMemo<Vault[]>(
    () => sortByName(vaultsData ?? []),
    [vaultsData]
  )

  const iconPrimary = { color: theme.colors.colorTextPrimary }
  const iconSecondary = { color: theme.colors.colorTextSecondary }

  const openInviteFlow = async (vault: Vault) => {
    if (inviteData?.vaultId !== vault.id) {
      setIsLoading(true)
      try {
        await createInvite()
      } finally {
        setIsLoading(false)
      }
    }
    setModal(<ShareVaultModalContentV2 />)
  }

  const handleCreate = () => {
    setModal(
      <CreateOrEditVaultModalContentV2
        onClose={closeModal}
        onSuccess={closeModal}
      />
    )
  }

  const handleVaultClick = (vault: Vault) => {
    if (vault.id !== activeVault?.id) {
      void switchVault(vault)
    }
  }

  const handleInvite = (vault: Vault) => {
    void openInviteFlow(vault)
  }

  const handleRename = (vault: Vault) => {
    setModal(
      <CreateOrEditVaultModalContentV2
        vault={vault}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    )
  }

  return (
    <div style={styles.wrapper} data-testid="vault-selector">
      <div style={styles.titleRow}>
        <div style={styles.titleLabel}>
          <Text
            variant="labelEmphasized"
            color={theme.colors.colorTextSecondary}
          >
            {t`Vaults`}
          </Text>
        </div>
        <Button
          variant="tertiary"
          size="small"
          data-testid="vault-selector-create"
          aria-label={t`Create new vault`}
          onClick={handleCreate}
          iconBefore={<Add style={iconSecondary} />}
        />
      </div>

      <div style={styles.list}>
        {vaults.map((vault) => (
          <VaultRow
            key={vault.id}
            vault={vault}
            isActive={vault.id === activeVault?.id}
            iconPrimary={iconPrimary}
            styles={styles}
            onSelect={handleVaultClick}
            onInvite={handleInvite}
            onRename={handleRename}
          />
        ))}
      </div>
    </div>
  )
}

type VaultRowProps = {
  vault: Vault
  isActive: boolean
  iconPrimary: { color: string }
  styles: ReturnType<typeof createStyles>
  onSelect: (vault: Vault) => void
  onInvite: (vault: Vault) => void
  onRename: (vault: Vault) => void
}

const VaultRow = ({
  vault,
  isActive,
  iconPrimary,
  styles,
  onSelect,
  onInvite,
  onRename
}: VaultRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const withMenuClose = (handler: (vault: Vault) => void) => () => {
    setMenuOpen(false)
    handler(vault)
  }

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const actionButtonStyle = styles.iconActionButton as React.ComponentProps<
    typeof Button
  >['style']

  const rightElement = (
    <div
      style={styles.rowActions}
      onClick={stopPropagation}
      data-testid={`vault-row-actions-${vault.id}`}
    >
      <Button
        variant="tertiary"
        size="small"
        data-testid={`vault-row-invite-${vault.id}`}
        aria-label={t`Invite to vault`}
        onClick={() => onInvite(vault)}
        style={actionButtonStyle}
        iconBefore={
          <PersonAddAlt width={16} height={16} color={iconPrimary.color} />
        }
      />
      <ContextMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        menuWidth={VAULT_ACTIONS_MENU_WIDTH}
        testID={`vault-row-menu-${vault.id}`}
        trigger={
          <Button
            variant="tertiary"
            size="small"
            aria-label={t`Vault actions`}
            style={actionButtonStyle}
            iconBefore={
              <MoreVert width={16} height={16} color={iconPrimary.color} />
            }
          />
        }
      >
        <div style={styles.menuGroup}>
          <NavbarListItem
            size="small"
            icon={<EditOutlined color={iconPrimary.color} />}
            label={t`Rename`}
            testID={`vault-row-rename-${vault.id}`}
            onClick={withMenuClose(onRename)}
          />
        </div>
      </ContextMenu>
    </div>
  )

  return (
    <ListItem
      icon={<LockFilled color={iconPrimary.color} />}
      iconSize={16}
      title={vault.name}
      selected={isActive}
      style={styles.vaultRow as React.ComponentProps<typeof ListItem>['style']}
      testID={`vault-row-${vault.id}`}
      onClick={() => onSelect(vault)}
      rightElement={isActive ? rightElement : undefined}
    />
  )
}
