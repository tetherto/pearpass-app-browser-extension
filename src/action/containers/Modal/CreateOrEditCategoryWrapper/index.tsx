import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { CreateOrEditCreditCardModalContentV2 } from './CreateOrEditCreditCardModalContentV2/CreateOrEditCreditCardModalContentV2'
import { CreateOrEditCustomModalContentV2 } from './CreateOrEditCustomModalContentV2/CreateOrEditCustomModalContentV2'
import { CreateOrEditIdentityModalContentV2 } from './CreateOrEditIdentityModalContentV2/CreateOrEditIdentityModalContentV2'
import { CreateOrEditLoginModalContentV2 } from './CreateOrEditLoginModalContentV2/CreateOrEditLoginModalContentV2'
import { CreateOrEditNoteModalContentV2 } from './CreateOrEditNoteModalContentV2/CreateOrEditNoteModalContentV2'
import { CreateOrEditPassPhraseModalContentV2 } from './CreateOrEditPassPhraseModalContentV2/CreateOrEditPassPhraseModalContentV2'
import { CreateOrEditWifiModalContentV2 } from './CreateOrEditWifiModalContentV2/CreateOrEditWifiModalContentV2'

export type CreateOrEditCategoryWrapperProps = {
  recordType?: string
  initialRecord?: Parameters<
    typeof CreateOrEditLoginModalContentV2
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
  if (recordType === RECORD_TYPES.LOGIN) {
    return (
      <CreateOrEditLoginModalContentV2
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
      <CreateOrEditNoteModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.WIFI_PASSWORD) {
    return (
      <CreateOrEditWifiModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.CUSTOM) {
    return (
      <CreateOrEditCustomModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.IDENTITY) {
    return (
      <CreateOrEditIdentityModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.CREDIT_CARD) {
    return (
      <CreateOrEditCreditCardModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  if (recordType === RECORD_TYPES.PASS_PHRASE) {
    return (
      <CreateOrEditPassPhraseModalContentV2
        initialRecord={initialRecord}
        selectedFolder={selectedFolder}
        isFavorite={isFavorite}
      />
    )
  }

  return null
}
