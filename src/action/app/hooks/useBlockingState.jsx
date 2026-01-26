import { useEffect, useState } from 'react'

import { client } from '../../../shared/client'
import {
  BACKGROUND_MESSAGE_TYPES,
  BLOCKING_STATE,
  VAULT_CLIENT_EVENTS
} from '../../../shared/constants/nativeMessaging'
import { NAVIGATION_ROUTES } from '../../../shared/constants/navigation.js'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext.jsx'
import { secureChannelMessages } from '../../../shared/services/messageBridge'
import { logger } from '../../../shared/utils/logger'
import { DesktopConnectionModalContent } from '../../containers/Modal/DesktopConnectionModalContent'
import { PairingRequiredModalContent } from '../../containers/Modal/PairingRequiredModalContent'

/**
 * Hook to check blocking state on extension open and reactively handle
 * pairing/connection errors during operation.
 * Returns { isChecking, blockingState }.
 */
export const useBlockingState = () => {
  const { navigate } = useRouter()
  const { setModal, closeModal, closeAllModals } = useModal()
  const [isChecking, setIsChecking] = useState(true)
  const [blockingState, setBlockingState] = useState(null)

  const onPairSuccess = () => {
    void closeModal()
    navigate('welcome', { params: { state: NAVIGATION_ROUTES.VAULTS } })
  }

  const showPairingModal = () => {
    closeAllModals()
    setModal(<PairingRequiredModalContent onPairSuccess={onPairSuccess} />, {
      closeable: false
    })
  }

  const showConnectionModal = (onRetry) => {
    closeAllModals()
    setModal(
      <DesktopConnectionModalContent
        onRetry={
          onRetry ||
          (async () => {
            const result = await secureChannelMessages.getBlockingState()
            if (result.success && !result.blockingState) {
              closeAllModals()
              navigate('welcome', {
                params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
              })
            }
            return result.blockingState
              ? { available: false, message: result.blockingState.error }
              : { available: true }
          })
        }
        onClose={() => {
          closeAllModals()
        }}
      />,
      {
        fullScreen: true,
        hasOverlay: false,
        closeable: false
      }
    )
  }

  // Proactive check on extension open
  const checkAndHandleBlockingState = async () => {
    try {
      setIsChecking(true)
      const result = await secureChannelMessages.getBlockingState()

      if (!result.success) {
        logger.error(
          '[useBlockingState] Failed to get blocking state:',
          result.error
        )
        setIsChecking(false)
        return
      }

      const state = result.blockingState
      setBlockingState(state)

      if (!state) {
        setIsChecking(false)
        return
      }

      logger.log('[useBlockingState] Blocking state:', state.state)

      switch (state.state) {
        case BLOCKING_STATE.PAIRING:
          showPairingModal()
          break
        case BLOCKING_STATE.CONNECTION:
          showConnectionModal()
          break
        case BLOCKING_STATE.AUTH:
          // AUTH means keypair needs unlocking - normal flow handles this
          break
      }

      setIsChecking(false)
    } catch (e) {
      logger.error('[useBlockingState] Error:', e)
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkAndHandleBlockingState()
  }, [])

  // Reactive: Listen for pairing events from background and vault client
  useEffect(() => {
    const handlePairingRequired = (event) => {
      logger.log('[useBlockingState] Pairing required event:', event)
      showPairingModal()
    }

    const handleMessage = (message) => {
      if (message.type === BACKGROUND_MESSAGE_TYPES.PAIRING_REQUIRED) {
        handlePairingRequired({ reason: message.reason })
      }
    }

    client.on(VAULT_CLIENT_EVENTS.PAIRING_REQUIRED, handlePairingRequired)
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      client.off(VAULT_CLIENT_EVENTS.PAIRING_REQUIRED, handlePairingRequired)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [closeAllModals, closeModal, setModal])

  return { isChecking, blockingState }
}
