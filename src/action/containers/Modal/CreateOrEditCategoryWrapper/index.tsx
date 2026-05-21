import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { CreateOrEditAuthenticatorModalContent } from './CreateOrEditAuthenticatorModalContent/CreateOrEditAuthenticatorModalContent'
import { CreateOrEditCreditCardModalContent } from './CreateOrEditCreditCardModalContent/CreateOrEditCreditCardModalContent'
import { CreateOrEditCustomModalContent } from './CreateOrEditCustomModalContent/CreateOrEditCustomModalContent'
import { CreateOrEditIdentityModalContent } from './CreateOrEditIdentityModalContent/CreateOrEditIdentityModalContent'
import { CreateOrEditLoginModalContent } from './CreateOrEditLoginModalContent/CreateOrEditLoginModalContent'
import { CreateOrEditNoteModalContent } from './CreateOrEditNoteModalContent/CreateOrEditNoteModalContent'
import { CreateOrEditPassPhraseModalContent } from './CreateOrEditPassPhraseModalContent/CreateOrEditPassPhraseModalContent'
import { CreateOrEditWifiModalContent } from './CreateOrEditWifiModalContent/CreateOrEditWifiModalContent'

export type CreateOrEditCategoryWrapperProps = {
  recordType?: string
  initialRecord?: Parameters<
    typeof CreateOrEditLoginModalContent
  >[0]['initialRecord']
  selectedFolder?: string
  isFavorite?: boolean
  mode?: 'authenticator'
  onSaved?: (savedRecordId?: string) => void
  fullScreen?: boolean
  onClose?: () => void
}

export const CreateOrEditCategoryWrapper = ({
  recordType,
  initialRecord,
  selectedFolder,
  isFavorite,
  mode,
  onSaved,
  fullScreen,
  onClose
}: CreateOrEditCategoryWrapperProps) => {
  if (recordType === RECORD_TYPES.OTP) {
    return (
      <CreateOrEditAuthenticatorModalContent
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
        onSaved={onSaved}
      />
    )
  }

  if (recordType === RECORD_TYPES.LOGIN) {
    return (
      <CreateOrEditLoginModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
        mode={mode}
        onSaved={onSaved}
        fullScreen={fullScreen}
        onClose={onClose}
      />
    )
  }

  if (recordType === RECORD_TYPES.NOTE) {
    return (
      <CreateOrEditNoteModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.WIFI_PASSWORD) {
    return (
      <CreateOrEditWifiModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.CUSTOM) {
    return (
      <CreateOrEditCustomModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.IDENTITY) {
    return (
      <CreateOrEditIdentityModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.CREDIT_CARD) {
    return (
      <CreateOrEditCreditCardModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.PASS_PHRASE) {
    return (
      <CreateOrEditPassPhraseModalContent
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  return null
}
