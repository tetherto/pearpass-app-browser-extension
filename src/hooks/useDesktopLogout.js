import { useCallback, useEffect } from 'react'

import { useVaults } from '@tetherto/pearpass-lib-vault'

import { getClient } from '../shared/client'
import { VAULT_CLIENT_EVENTS } from '../shared/constants/nativeMessaging'
import { logger } from '../shared/utils/logger'

/**
 * Hook to handle desktop logout events in the extension.
 * When the desktop app logs out (due to inactivity or manual logout),
 * the extension should also log out to maintain synchronized state.
 * @param {Object} options - Options for the hook
 * @param {Function} options.onLogout - Callback to be called on desktop logout
 */
export const useDesktopLogout = ({ onLogout } = {}) => {
  const { resetState: resetVaultState } = useVaults()

  const handleDesktopLogout = useCallback(
    async (eventData) => {
      // Extract reason from event data
      const logoutReason =
        typeof eventData === 'string'
          ? eventData
          : eventData?.reason || 'desktop-unauthenticated'

      logger.log(
        'useDesktopLogout',
        'info',
        `Desktop logout event received: ${logoutReason}`
      )

      try {
        resetVaultState()

        if (onLogout) {
          await onLogout()
        }
      } catch (error) {
        logger.log(
          'useDesktopLogout',
          'error',
          `Failed to handle desktop logout: ${error.message}`
        )
      }
    },
    [onLogout, resetVaultState]
  )

  // Setup event listener for desktop logout notifications
  useEffect(() => {
    let vaultClient

    try {
      vaultClient = getClient()
    } catch {
      // Client not yet initialized
      return
    }

    // Register event listener for desktop logout events
    vaultClient.on(VAULT_CLIENT_EVENTS.DESKTOP_LOGOUT, handleDesktopLogout)

    return () => {
      vaultClient.off(VAULT_CLIENT_EVENTS.DESKTOP_LOGOUT, handleDesktopLogout)
    }
  }, [handleDesktopLogout])
}
