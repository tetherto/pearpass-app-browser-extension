import { t } from '@lingui/core/macro'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useModal } from '../../context/ModalContext'

type ReplacePasskeyModalContentV2Props = {
  onConfirm: () => void | Promise<void>
}

export const ReplacePasskeyModalContentV2 = ({
  onConfirm
}: ReplacePasskeyModalContentV2Props) => {
  const { closeModal } = useModal()
  const { theme } = useTheme()

  const handleConfirm = async () => {
    closeModal()
    await onConfirm()
  }

  return (
    <Dialog
      title={t`Overwrite passkey?`}
      onClose={closeModal}
      testID="replace-passkey-dialog-v2"
      closeButtonTestID="replace-passkey-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="replace-passkey-keep-existing-v2"
          >
            {t`Keep Existing`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={handleConfirm}
            data-testid="replace-passkey-overwrite-v2"
          >
            {t`Overwrite`}
          </Button>
        </>
      }
    >
      <Text variant="body" color={theme.colors.colorTextSecondary}>
        {t`This item already has a saved passkey. If you continue, the old key will be removed and replaced with the new one.`}
      </Text>
    </Dialog>
  )
}
