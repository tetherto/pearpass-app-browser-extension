import { useCallback } from 'react'

import { t } from '@lingui/core/macro'
import { useVault, type Vault } from '@tetherto/pearpass-lib-vault'

import { VaultPasswordFormModalContent } from '../containers/VaultPasswordFormModalContent'
import { useLoadingContext } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'
import { useToast } from '../context/ToastContext'
import { logger } from '../utils/logger'

/**
 * Switch active vault with the same flow everywhere: optional password modal
 * when the vault is protected, then `refetch` from `useVault` and an optional success callback.
 */
export function useVaultSwitch() {
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()
  const { setToast } = useToast() as {
    setToast: (toast: { message: string }) => void
  }
  const {
    data: activeVault,
    isVaultProtected,
    refetch: refetchVault
  } = useVault()

  const switchVault = useCallback(
    async (
      vault: Vault,
      onSuccess: () => void | Promise<void> = async () => {}
    ) => {
      setIsLoading(true)

      try {
        if (vault.id === activeVault?.id) {
          await onSuccess()
          return
        }

        const isProtected = await isVaultProtected(vault.id)

        if (isProtected) {
          setModal(
            <VaultPasswordFormModalContent
              vault={vault}
              onSubmit={async (password: string) => {
                setIsLoading(true)
                try {
                  await refetchVault(vault.id, { password })
                  closeModal()
                  await onSuccess()
                } catch (error) {
                  throw error
                } finally {
                  setIsLoading(false)
                }
              }}
            />
          )
          return
        }

        await refetchVault(vault.id)
        await onSuccess()
      } catch (error) {
        logger.error('useVaultSwitch', 'Error switching to vault:', error)
        setToast({
          message: t`Couldn't switch vault. Please try again.`
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeVault?.id, closeModal, isVaultProtected, setIsLoading, setModal]
  )

  return { switchVault }
}
