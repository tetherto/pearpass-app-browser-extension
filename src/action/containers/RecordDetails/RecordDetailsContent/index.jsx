import React from 'react'

import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { CreditCardDetailsForm } from '../CreditCardDetailsForm'
import { CustomDetailsForm } from '../CustomDetailsForm'
import { IdentityDetailsForm } from '../IdentityDetailsForm'
import { LoginDetailsForm } from '../LoginDetailsForm'
import { NoteDetailsForm } from '../NoteDetailsForm'
import { PassPhraseDetailsForm } from '../PassPhraseDetailsForm'
import { WifiDetailsForm } from '../WifiDetailsForm'

/**
 * @param {{
 *   record: {
 *      type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    }
 * }} props
 */
export const RecordDetailsContent = ({ record }) => {
  if (!record?.type) {
    return null
  }

  const sharedProps = {
    initialRecord: record
  }

  switch (record.type) {
    case RECORD_TYPES.CREDIT_CARD:
      return <CreditCardDetailsForm {...sharedProps} />
    case RECORD_TYPES.CUSTOM:
      return <CustomDetailsForm {...sharedProps} />
    case RECORD_TYPES.IDENTITY:
      return <IdentityDetailsForm {...sharedProps} />
    case RECORD_TYPES.LOGIN:
      return <LoginDetailsForm {...sharedProps} />
    case RECORD_TYPES.NOTE:
      return <NoteDetailsForm {...sharedProps} />
    case RECORD_TYPES.WIFI_PASSWORD:
      return <WifiDetailsForm {...sharedProps} />
    case RECORD_TYPES.PASS_PHRASE:
      return <PassPhraseDetailsForm {...sharedProps} />
    default:
      return null
  }
}
