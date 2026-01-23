import React, { useEffect } from 'react'

import { client } from '../../../shared/client'
import {
  BACKGROUND_MESSAGE_TYPES,
  VAULT_CLIENT_EVENTS
} from '../../../shared/constants/nativeMessaging'
import { useModal } from '../../../shared/context/ModalContext'
import { logger } from '../../../shared/utils/logger'
import { PairingRequiredModalContent } from '../../containers/Modal/PairingRequiredModalContent'

export const usePairingRequired = () => {
  const { setModal, closeModal, closeAllModals } = useModal()

  const onPairSuccess = () => {
    closeModal()
    window.location.reload()
  }

  useEffect(() => {
    const handlePairingRequired = (event) => {
      closeAllModals()

      setModal(<PairingRequiredModalContent onPairSuccess={onPairSuccess} />, {
        closeable: false
      })

      logger.log('[PairingRequired] Showing pairing modal due to:', event)
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
  }, [])
}
