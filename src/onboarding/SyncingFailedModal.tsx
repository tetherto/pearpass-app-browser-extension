import { useState } from 'react'

import { Trans } from '@lingui/react/macro'
import { Button, Text, Title, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Sync } from '@tetherto/pearpass-lib-ui-kit/icons'

const TEST_IDS = {
  root: 'syncing-failed-modal',
  retryButton: 'syncing-failed-modal-retry',
  cancelButton: 'syncing-failed-modal-cancel',
  errorDetail: 'syncing-failed-modal-error-detail'
} as const

interface SyncingFailedModalProps {
  onRetry: () => void | Promise<void>
  onCancel?: () => void
  errorMessage?: string
}

export const SyncingFailedModal = ({
  onRetry,
  onCancel,
  errorMessage
}: SyncingFailedModalProps) => {
  const { theme } = useTheme()
  const { colors } = theme

  const [loading, setLoading] = useState(false)

  const handleRetry = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onRetry()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid={TEST_IDS.root}
      className="bg-surface-primary flex w-full max-w-[500px] flex-col gap-[var(--spacing24)] rounded-[var(--radius8)] p-[var(--spacing24)]"
    >
      <div className="flex flex-col items-center gap-[var(--spacing8)] text-center">
        <Title as="h2">
          <Trans>Syncing Failed</Trans>
        </Title>
        <Text variant="body" color={colors.colorTextSecondary}>
          <Trans>
            Ensure the PearPass desktop app is open and Browser Sync is enabled.
          </Trans>
        </Text>
        {errorMessage && (
          <Text
            variant="caption"
            color={colors.colorTextTertiary}
            data-testid={TEST_IDS.errorDetail}
          >
            {errorMessage}
          </Text>
        )}
      </div>
      <div className="flex w-full items-center justify-end gap-[var(--spacing8)]">
        {onCancel && (
          <Button
            variant="secondary"
            size="medium"
            onClick={onCancel}
            disabled={loading}
            data-testid={TEST_IDS.cancelButton}
          >
            <Trans>Re-enter code</Trans>
          </Button>
        )}
        <Button
          variant="primary"
          size="medium"
          onClick={handleRetry}
          disabled={loading}
          isLoading={loading}
          iconBefore={<Sync />}
          data-testid={TEST_IDS.retryButton}
        >
          <Trans>Sync Again</Trans>
        </Button>
      </div>
    </div>
  )
}
