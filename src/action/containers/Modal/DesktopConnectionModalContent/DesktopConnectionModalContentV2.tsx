import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useModal } from '../../../../shared/context/ModalContext'
import { logger } from '../../../../shared/utils/logger'

const TEST_IDS = {
  root: 'desktop-connection-modal',
  closeButton: 'desktop-connection-modal-close',
  discardButton: 'desktop-connection-modal-discard',
  retryButton: 'desktop-connection-modal-retry'
} as const

type RetryResult = { success?: boolean; message?: string } | undefined | void

interface DesktopConnectionModalContentV2Props {
  onRetry?: () => Promise<RetryResult>
  onClose?: () => void
}

export const DesktopConnectionModalContentV2 = ({
  onRetry,
  onClose
}: DesktopConnectionModalContentV2Props) => {
  const { theme } = useTheme()
  const { colors } = theme
  const { closeModal } = useModal() as { closeModal: () => Promise<void> }

  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      void closeModal()
    }
    window.close()
  }

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
    } catch (error) {
      logger.error('Retry failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      title={t`Desktop app required`}
      onClose={handleClose}
      testID={TEST_IDS.root}
      closeButtonTestID={TEST_IDS.closeButton}
      footer={
        <div className="flex w-full items-center justify-end gap-[8px]">
          <Button
            variant="secondary"
            size="small"
            onClick={handleClose}
            disabled={loading}
            data-testid={TEST_IDS.discardButton}
          >
            <Trans>Discard</Trans>
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleRetry}
            disabled={loading}
            isLoading={loading}
            data-testid={TEST_IDS.retryButton}
          >
            <Trans>Sync again</Trans>
          </Button>
        </div>
      }
    >
      <Text variant="caption" color={colors.colorTextSecondary}>
        <Trans>
          The browser extension needs the PearPass desktop app to be open and
          running to access your secure vaults.
        </Trans>
      </Text>
    </Dialog>
  )
}
