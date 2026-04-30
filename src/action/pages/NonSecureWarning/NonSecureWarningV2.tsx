import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useAllowHttpEnabled } from '../../../shared/hooks/useAllowHttpEnabled'

const TEST_IDS = {
  root: 'non-secure-warning',
  closeButton: 'non-secure-warning-close',
  discardButton: 'non-secure-warning-discard',
  enableButton: 'non-secure-warning-enable'
} as const

export const NonSecureWarningV2 = () => {
  const { theme } = useTheme()
  const { colors } = theme

  const [, setAllowHttpEnabled] = useAllowHttpEnabled() as [
    boolean,
    (value: boolean) => void
  ]

  const handleClose = () => {
    window.close()
  }

  const handleEnable = () => {
    setAllowHttpEnabled(true)
  }

  return (
    <Dialog
      title={t`Extension disabled on this site`}
      onClose={handleClose}
      closeOnOutsideClick={false}
      testID={TEST_IDS.root}
      closeButtonTestID={TEST_IDS.closeButton}
      footer={
        <div className="flex w-full items-center justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            onClick={handleClose}
            data-testid={TEST_IDS.discardButton}
          >
            <Trans>Discard</Trans>
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleEnable}
            data-testid={TEST_IDS.enableButton}
          >
            <Trans>Enable browser extension</Trans>
          </Button>
        </div>
      }
    >
      <Text variant="caption" color={colors.colorTextSecondary}>
        <Trans>
          For your security, the extension is disabled on non-secure (HTTP)
          websites by default. If you trust this site, you can enable the
          extension for this website only.
        </Trans>
      </Text>
    </Dialog>
  )
}
