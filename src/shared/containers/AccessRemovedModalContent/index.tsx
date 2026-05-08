import { t } from '@lingui/core/macro'
import { Button, Dialog, Text } from '@tetherto/pearpass-lib-ui-kit'

import { useModal } from '../../context/ModalContext'

export type AccessRemovedModalContentProps = {
  vaultName: string
  deviceName?: string
  onClose?: () => void
}

export const AccessRemovedModalContent = ({
  vaultName,
  deviceName,
  onClose
}: AccessRemovedModalContentProps) => {
  const { closeModal } = useModal() as { closeModal: () => void }

  const handleClose = onClose ?? closeModal

  const lead = deviceName
    ? t`Your access to ${vaultName} has been removed by ${deviceName}.`
    : t`Your access to ${vaultName} has been removed.`

  return (
    <Dialog
      title={t`Access Removed`}
      onClose={handleClose}
      testID="access-removed-dialog"
      closeButtonTestID="access-removed-close"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={handleClose}
            data-testid="access-removed-understood"
          >
            {t`Understood`}
          </Button>
        </div>
      }
    >
      <div className="flex w-full flex-col gap-[var(--spacing4)]">
        <Text as="p" variant="label" data-testid="access-removed-lead">
          {lead}
        </Text>
        <Text as="p" variant="label">
          {t`This vault will no longer be available on this device.`}
        </Text>
      </div>
    </Dialog>
  )
}
