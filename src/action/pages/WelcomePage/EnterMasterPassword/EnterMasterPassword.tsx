import React, { useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useUserData, useVault, useVaults } from '@tetherto/pearpass-lib-vault'

import { MasterPasswordPrompt } from '../../../containers/MasterPasswordPrompt/MasterPasswordPrompt'
import { useVaultOpenedRedirect } from '../../../app/hooks/useVaultOpenedRedirect'
import { AUTH_ERROR_PATTERNS } from '../../../../shared/constants/auth'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useRouter } from '../../../../shared/context/RouterContext'
import { secureChannelMessages } from '../../../../shared/services/messageBridge'
import {
  getLastOpenedVaultId,
  setLastOpenedVaultId
} from '../../../../shared/utils/lastOpenedVaultStorage'
import { logger } from '../../../../shared/utils/logger'
import { sortByName } from '../../../../shared/utils/sortByName'

export const EnterMasterPassword = () => {
  const { navigate, currentPage } = useRouter()
  const { logIn, refreshMasterPasswordStatus } = useUserData()
  const { isVaultProtected, refetch: refetchVault } = useVault()
  const navigateAfterVaultOpened = useVaultOpenedRedirect()

  const [error, setError] = useState<string>('')

  const { initVaults, refetch: refetchVaults } = useVaults()

  const handleSubmit = useCallback(
    async (password: string) => {
      setError('')

      try {
        try {
          await secureChannelMessages.unlockClientKeystore(password)
        } catch (keystoreErr) {
          const message = (keystoreErr as Error)?.message
          if (message?.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)) {
            setError(t`Incorrect password. Please try again.`)
            logger.error(
              'Error unlocking secure channel keystore:',
              keystoreErr
            )
            return
          }
          logger.error(
            'Error initializing secure channel keystore:',
            keystoreErr
          )
        }

        await logIn({ password })
        await initVaults({ password })

        const vaults = await refetchVaults()
        const sortedVaults = sortByName(vaults) as Array<{
          id: string
          name: string
        }>

        const storedVaultId = getLastOpenedVaultId()
        const targetVault =
          sortedVaults.find((vault) => vault.id === storedVaultId) ??
          sortedVaults[0]

        if (!targetVault) {
          navigate(currentPage, {
            params: { state: NAVIGATION_ROUTES.VAULTS }
          })
          return
        }

        const protectedVault = await isVaultProtected(targetVault.id)
        if (protectedVault) {
          navigate(currentPage, {
            params: {
              state: NAVIGATION_ROUTES.VAULT_PASSWORD,
              vaultId: targetVault.id
            }
          })
          return
        }

        await refetchVault(targetVault.id)
        setLastOpenedVaultId(targetVault.id)
        navigateAfterVaultOpened()
      } catch (submitError) {
        const status = await refreshMasterPasswordStatus()
        const { isLocked, remainingAttempts } = status || {}

        if (isLocked) {
          navigate('welcome', {
            params: { state: NAVIGATION_ROUTES.SCREEN_LOCKED }
          })
          return
        }

        setError(
          typeof submitError === 'string'
            ? submitError
            : t`Incorrect password. You have ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} before the app will be temporarily locked.`
        )
        logger.error('Error unlocking PearPass:', submitError)
      }
    },
    [
      logIn,
      initVaults,
      refetchVaults,
      isVaultProtected,
      refetchVault,
      navigateAfterVaultOpened,
      refreshMasterPasswordStatus,
      navigate,
      currentPage
    ]
  )

  return (
    <MasterPasswordPrompt
      onSubmit={handleSubmit}
      error={error}
      onPasswordChange={() => {
        if (error) setError('')
      }}
      testID="unlock-password-input-v2"
    />
  )
}
