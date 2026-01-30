import { useCallback, useEffect, useState, useRef } from 'react'

import { client } from '../../../shared/client'
import {
  BACKGROUND_MESSAGE_TYPES,
  BLOCKING_STATE,
  VAULT_CLIENT_EVENTS
} from '../../../shared/constants/nativeMessaging'
import { NAVIGATION_ROUTES } from '../../../shared/constants/navigation'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
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
  const { setModal, closeAllModals } = useModal()

  const [isChecking, setIsChecking] = useState(true)
  const [blockingState, setBlockingState] = useState(null)

  const pairingModalOpenRef = useRef(false)

  const onPairSuccess = useCallback(() => {
    pairingModalOpenRef.current = false
    setBlockingState(null)
    closeAllModals()
    navigate('welcome', { params: { state: NAVIGATION_ROUTES.VAULTS } })
  }, [navigate, closeAllModals])

  const showPairingModal = useCallback(() => {
    if (pairingModalOpenRef.current) return
    pairingModalOpenRef.current = true
    closeAllModals()
    setModal(<PairingRequiredModalContent onPairSuccess={onPairSuccess} />, {
      closeable: false
    })
  }, [closeAllModals, setModal, onPairSuccess])

  const handleConnectionRetry = useCallback(async () => {
    const result = await secureChannelMessages.getBlockingState()

    if (result.success && !result.blockingState) {
      pairingModalOpenRef.current = false
      setBlockingState(null)
      closeAllModals()
      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
      return { success: true }
    }

    return {
      success: false,
      message: result.blockingState?.error
    }
  }, [closeAllModals, navigate])

  const showConnectionModal = useCallback(
    (onRetry) => {
      closeAllModals()
      setModal(
        <DesktopConnectionModalContent
          onRetry={onRetry}
          onClose={closeAllModals}
        />,
        { fullScreen: true, hasOverlay: false, closeable: false }
      )
    },
    [closeAllModals, setModal]
  )

  const checkAndHandleBlockingState = useCallback(async () => {
    setIsChecking(true)
    try {
      const result = await secureChannelMessages.getBlockingState()

      if (!result.success) {
        logger.error(
          '[useBlockingState] Failed to get blocking state:',
          result.error
        )
        return
      }

      const state = result.blockingState
      setBlockingState(state)

      if (!state) return

      logger.log('[useBlockingState] Blocking state:', state.state)

      switch (state.state) {
        case BLOCKING_STATE.PAIRING:
          showPairingModal()
          break
        case BLOCKING_STATE.CONNECTION:
          showConnectionModal(handleConnectionRetry)
          break
      }
    } catch (error) {
      logger.error('[useBlockingState] Unexpected error:', error)
    } finally {
      setIsChecking(false)
    }
  }, [handleConnectionRetry, showConnectionModal, showPairingModal])

  // Run once on mount
  useEffect(() => {
    void checkAndHandleBlockingState()
  }, [checkAndHandleBlockingState])

  // Listen for pairing events from background and vault client
  useEffect(() => {
    const handlePairingRequired = ({ reason }) => {
      logger.log('[useBlockingState] Pairing required:', reason)

      setBlockingState({
        state: BLOCKING_STATE.PAIRING,
        error: reason
      })
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
  }, [showPairingModal])

  return { isChecking, blockingState }
}
