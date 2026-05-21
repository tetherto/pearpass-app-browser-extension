import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { useModal } from '../../shared/context/ModalContext'
import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import type { CreateOrEditCategoryWrapperProps } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordModalContent } from '../containers/Modal/GeneratePasswordModalContent/GeneratePasswordModalContent'

const SUPPORTED_V2_TYPES = new Set<string>([
  // OTP is the menu entry point; the record still persists as LOGIN (with
  // data.otpInput). Keep here so handleSelectType can pass mode='authenticator'
  // through the v2 path.
  RECORD_TYPES.OTP,
  RECORD_TYPES.LOGIN,
  RECORD_TYPES.NOTE,
  RECORD_TYPES.WIFI_PASSWORD,
  RECORD_TYPES.CUSTOM,
  RECORD_TYPES.IDENTITY,
  RECORD_TYPES.CREDIT_CARD,
  RECORD_TYPES.PASS_PHRASE
])

const PASSWORD_TYPE = 'password'

export type CreateOrEditRecordOptions = {
  recordType?: string
  initialRecord?: CreateOrEditCategoryWrapperProps['initialRecord']
  selectedFolder?: string
  isFavorite?: boolean
  source?: string
  mode?: 'authenticator'
  onSaved?: (savedRecordId?: string) => void
  /** Optional callback for the password-generator flow — receives the chosen
   * password and lets the caller (e.g. Login / Wi-Fi V2 modal) write it into
   * its own form state. */
  setValue?: (value: string) => void
}

export const useCreateOrEditRecord = () => {
  const { setModal } = useModal()

  const handleCreateOrEditRecord = (
    options: CreateOrEditRecordOptions = {}
  ) => {
    const {
      recordType,
      initialRecord,
      selectedFolder,
      isFavorite,
      mode,
      onSaved,
      setValue
    } = options

    if (recordType === PASSWORD_TYPE) {
      setModal(<GeneratePasswordModalContent onPasswordInsert={setValue} />)
      return
    }

    if (recordType && SUPPORTED_V2_TYPES.has(recordType)) {
      setModal(
        <CreateOrEditCategoryWrapper
          recordType={recordType}
          initialRecord={initialRecord}
          selectedFolder={selectedFolder}
          isFavorite={isFavorite}
          mode={mode}
          onSaved={onSaved}
        />
      )
    }
  }

  return { handleCreateOrEditRecord }
}
