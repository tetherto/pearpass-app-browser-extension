import { t } from '@lingui/core/macro'

import { ButtonCreate } from '../../components/ButtonCreate'
import { useModal } from '../../context/ModalContext'
import { ModalContent } from '../ModalContent'

/**
 * @param {{
 *   onConfirm: () => void | Promise<void>
 * }} props
 */
export const ReplacePasskeyModalContent = ({ onConfirm }) => {
  const { closeModal } = useModal()

  const handleConfirm = async () => {
    closeModal()
    await onConfirm()
  }

  return (
    <ModalContent
      onClose={closeModal}
      headerChildren={
        <div className="text-white-mode1 text-sm font-normal">
          {t`Replace existing passkey?`}
        </div>
      }
    >
      <div className="text-white-mode1 pt-1 text-sm font-normal opacity-80">
        {t`This item already has a passkey. Do you want to replace the current one with a new passkey?`}
      </div>

      <div className="flex flex-col gap-2 pt-5">
        <ButtonCreate onClick={handleConfirm}>{t`Confirm`}</ButtonCreate>
        <button
          onClick={closeModal}
          className="text-primary400-mode1 rounded-[10px] bg-black py-[9px] font-bold"
        >
          {t`Cancel`}
        </button>
      </div>
    </ModalContent>
  )
}
