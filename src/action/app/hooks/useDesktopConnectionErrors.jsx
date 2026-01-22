import { useEffect } from 'react'

import { AVAILABILITY_ERROR_MESSAGES } from '../../../shared/constants/nativeMessaging'
import { useToast } from '../../../shared/context/ToastContext'
import { registerModalHandlers } from '../../../vaultClient/globalVaultErrorHandler'

// Registers a toast handler for desktop connection errors reported by
// globalVaultErrorHandler.
export const useDesktopConnectionErrors = () => {
  const { setToast } = useToast()

  useEffect(() => {
    registerModalHandlers({
      showSyncFailedModal: () => {
        setToast({
          message: AVAILABILITY_ERROR_MESSAGES.INTEGRATION_DISABLED
        })
      }
    })
  }, [setToast])
}
