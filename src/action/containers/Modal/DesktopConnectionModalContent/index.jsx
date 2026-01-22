import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ButtonLittle } from '../../../../shared/components/ButtonLittle'
import { WelcomePageWrapper } from '../../../../shared/components/WelcomePageWrapper'
import { useModal } from '../../../../shared/context/ModalContext'
import { SyncIcon } from '../../../../shared/icons/SyncIcon'
import { logger } from '../../../../shared/utils/logger'

/**
 * @param {{
 *   onRetry?: () => Promise<void>
 *   onClose?: () => void
 * }} props
 */
export const DesktopConnectionModalContent = ({ onRetry, onClose }) => {
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) {
      handleClose()
      return
    }

    setLoading(true)
    try {
      const result = await onRetry()
      if (result && result.available === false) {
        throw new Error(result.message)
      }
      handleClose()
    } catch (error) {
      logger.error('Retry failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      void closeModal()
    }
  }
  return (
    <WelcomePageWrapper>
      <div className="flex h-full w-full flex-col items-center justify-center gap-[20px]">
        <span className="font-inter text-white-mode1 w-[310] py-[9] text-center text-[20px] leading-[24px] font-bold">
          <Trans>Open the desktop app to use the browser extension</Trans>
        </span>

        <div className="w-full">
          <ButtonLittle
            fullWidth
            className={`py-[9px] ${loading ? 'cursor-wait' : ''} w-full justify-center`}
            startIcon={SyncIcon}
            onClick={handleRetry}
            disabled={loading}
          >
            {loading ? (
              <Trans>{t`Syncing...`}</Trans>
            ) : (
              <Trans>{t`Sync data with desktop app`}</Trans>
            )}
          </ButtonLittle>
        </div>
      </div>
    </WelcomePageWrapper>
  )
}
