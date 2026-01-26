import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ButtonLittle } from '../../../../shared/components/ButtonLittle'
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
      if (result && result.success === false) {
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
    <div className="bg-grey500-mode1 relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-9 pt-[52px]">
      <img
        src="/assets/images/logoLock.png"
        className="absolute top-[52px] left-1/2 h-[50px] w-[190px] -translate-x-1/2"
      />

      <div className="z-10 flex w-full flex-col items-center gap-[20px]">
        <span className="font-inter text-white-mode1 w-[350] py-[9] text-center text-[20px] leading-[24px] font-bold">
          <Trans>
            Open the desktop app and activate browser extension to continue
          </Trans>
        </span>

        <ButtonLittle
          className={`w-full py-[9px] ${loading ? 'cursor-wait' : ''} justify-center`}
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

      <div className="bg-primary400-mode1 absolute bottom-0 left-1/2 z-[1] h-1/16 w-[100%] translate-x-[-50%] translate-y-[95%] rounded-2xl opacity-70 blur-[50px]" />
    </div>
  )
}
