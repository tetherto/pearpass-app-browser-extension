import { useEffect } from 'react'

import { useModal } from '../../../shared/context/ModalContext'
import {
  registerModalHandlers,
  resetSyncFailedModalState
} from '../../../vaultClient/globalVaultErrorHandler'
import { DesktopConnectionModalContent } from '../../containers/Modal/DesktopConnectionModalContent'

// Registers a full-screen modal for desktop connection errors reported by
// globalVaultErrorHandler.
export const useDesktopConnectionErrors = () => {
  const { setModal, closeAllModals } = useModal()

  useEffect(() => {
    registerModalHandlers({
      showSyncFailedModal: (onRetry) => {
        closeAllModals()

        setModal(
          <DesktopConnectionModalContent
            onRetry={onRetry}
            onClose={() => {
              resetSyncFailedModalState()
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
    })
  }, [closeAllModals, setModal])
}
