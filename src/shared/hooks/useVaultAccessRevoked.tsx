import { useCallback } from 'react'

import { useVault, useVaults, type Vault } from '@tetherto/pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../constants/navigation'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { logger } from '../utils/logger'
import { AccessRemovedModalContent } from '../containers/AccessRemovedModalContent'
import { useVaultSwitch } from './useVaultSwitch'

/**
 * Receive-side handler for "another device removed me from this vault".
 * Wipes local data and shows the access-removed modal.
 *
 * Currently invoked manually (e.g. via `window.__pearpassTriggerAccessRevoked`
 * for testing); will be wired into the action-bus once it lands.
 */
export const useVaultAccessRevoked = () => {
  const { setModal } = useModal() as {
    setModal: (content: React.ReactNode) => void
  }
  const { data: vaults } = useVaults()
  const { deleteVaultLocal } = useVault()
  const { switchVault } = useVaultSwitch()
  const { navigate } = useRouter() as {
    navigate: (page: string, data: { params: { state: string } }) => void
  }

  const triggerAccessRevoked = useCallback(
    async (vaultId: string, deviceName?: string) => {
      const vault = (vaults ?? []).find((v: Vault) => v.id === vaultId)
      const vaultName = vault?.name ?? vaultId

      try {
        await deleteVaultLocal(vaultId)
      } catch (error) {
        logger.error('useVaultAccessRevoked', 'deleteVaultLocal failed:', error)
        return
      }

      const next = (vaults ?? []).find((v: Vault) => v.id !== vaultId)
      if (next) {
        await switchVault(next)
      } else {
        navigate('welcome', {
          params: { state: NAVIGATION_ROUTES.VAULTS }
        })
      }

      setModal(
        <AccessRemovedModalContent
          vaultName={vaultName}
          deviceName={deviceName}
        />
      )
    },
    [vaults, deleteVaultLocal, switchVault, navigate, setModal]
  )

  return { triggerAccessRevoked }
}
