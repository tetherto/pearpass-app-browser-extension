import { useCallback, useEffect } from 'react'

import { t } from '@lingui/core/macro'
import {
  useCreateVault,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'

import { useVaultSwitch } from './useVaultSwitch'
import { AccessRemovedModalContent } from '../containers/AccessRemovedModalContent'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { useToast } from '../context/ToastContext'
import { platformMessages } from '../services/messageBridge'
import { logger } from '../utils/logger'

/**
 * Receive-side handler for "another device removed me from this vault".
 * Wipes local data, recovers to a fresh "Personal" vault when nothing
 * remains, and shows the access-removed modal.
 *
 * Triggered by the 'vault-access-revoked' event the lib emits from its
 * delete-vault action handler when an entry lands in this device's
 * actions queue (see pearpass-lib-vault/src/actions/index.js).
 */
export const useVaultAccessRevoked = () => {
  const { setModal } = useModal() as {
    setModal: (content: React.ReactNode) => void
  }
  const { setToast } = useToast() as {
    setToast: (toast: { message: string }) => void
  }
  const { navigate } = useRouter() as unknown as {
    navigate: (page: string, data: { state: { recordType: string } }) => void
  }
  const { data: vaults } = useVaults()
  const { data: activeVault, deleteVaultLocal, addDevice } = useVault()
  const { switchVault } = useVaultSwitch()
  const { createVault } = useCreateVault()

  const handleAccessRevoked = useCallback(
    async (payload: { vaultId?: string; actor?: string } = {}) => {
      const { vaultId, actor } = payload
      if (!vaultId) return

      const vault = (vaults ?? []).find((v: Vault) => v.id === vaultId)
      const vaultName = vault?.name ?? vaultId
      const deviceName = (vault?.devices ?? []).find(
        (d: { id?: string }) => d?.id === actor
      )?.name as string | undefined
      const wasActive = activeVault?.id === vaultId

      try {
        await deleteVaultLocal(vaultId)
      } catch (error) {
        logger.error('useVaultAccessRevoked', 'deleteVaultLocal failed:', error)
        return
      }

      if (wasActive) {
        const next = (vaults ?? []).find((v: Vault) => v.id !== vaultId)
        if (next) {
          await switchVault(next)
        } else {
          try {
            await createVault({ name: t`Personal` })
            const platform = (await platformMessages.getPlatformInfo()) as {
              os: string
              arch: string
            }
            await addDevice(`${platform.os} ${platform.arch}`)
            navigate('vault', { state: { recordType: 'all' } })
            setToast({
              message: t`A new "Personal" vault was created`
            })
          } catch (error) {
            logger.error(
              'useVaultAccessRevoked',
              'failed to create fallback Personal vault:',
              error
            )
          }
        }
      }

      setModal(
        <AccessRemovedModalContent
          vaultName={vaultName}
          deviceName={deviceName}
        />
      )
    },
    [
      vaults,
      activeVault?.id,
      deleteVaultLocal,
      switchVault,
      createVault,
      addDevice,
      navigate,
      setModal,
      setToast
    ]
  )

  useEffect(() => {
    const client = pearpassVaultClient as unknown as
      | undefined
      | {
          on?: (event: string, handler: (payload: unknown) => void) => void
          off?: (event: string, handler: (payload: unknown) => void) => void
        }
    if (!client?.on) return
    client.on(
      'vault-access-revoked',
      handleAccessRevoked as (payload: unknown) => void
    )
    return () => {
      client.off?.(
        'vault-access-revoked',
        handleAccessRevoked as (payload: unknown) => void
      )
    }
  }, [handleAccessRevoked])
}
