import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Button, Dialog } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { PasswordGeneratorV2 } from '../../../../shared/containers/PasswordGeneratorV2'
import { useModal } from '../../../../shared/context/ModalContext'
import { useToast } from '../../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../../shared/hooks/useCopyToClipboard'

export type GeneratePasswordModalContentV2Props = {
  onPasswordInsert?: (value: string) => void
  primaryActionLabel?: string
}

export const GeneratePasswordModalContentV2 = ({
  onPasswordInsert,
  primaryActionLabel
}: GeneratePasswordModalContentV2Props) => {
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const [generated, setGenerated] = useState('')

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({ message: t`Copied to clipboard`, icon: null })
    }
  })

  const handlePrimary = () => {
    if (onPasswordInsert) {
      onPasswordInsert(generated)
    } else {
      copyToClipboard(generated)
    }
    void closeModal()
  }

  const isCopyMode = !onPasswordInsert
  const primaryLabel =
    primaryActionLabel ?? (isCopyMode ? t`Copy Password` : t`Use Password`)

  return (
    <Dialog
      title={t`New Password Item`}
      onClose={closeModal}
      testID="generatepassword-dialog-v2"
      closeButtonTestID="generatepassword-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="generatepassword-v2-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={!generated}
            iconBefore={
              isCopyMode ? <ContentCopy width={16} height={16} /> : undefined
            }
            onClick={handlePrimary}
            data-testid="generatepassword-v2-primary"
          >
            {primaryLabel}
          </Button>
        </div>
      }
    >
      <PasswordGeneratorV2 onGeneratedChange={setGenerated} />
    </Dialog>
  )
}
