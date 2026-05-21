import React from 'react'

import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { CreditCardDetailsForm } from '../CreditCardDetailsForm'
import { CustomDetailsForm } from '../CustomDetailsForm'
import { IdentityDetailsForm } from '../IdentityDetailsForm'
import { LoginDetailsForm } from '../LoginDetailsForm'
import { NoteDetailsForm } from '../NoteDetailsForm'
import { PassPhraseDetailsForm } from '../PassPhraseDetailsForm'
import { WifiDetailsForm } from '../WifiDetailsForm'

type RecordShape = {
  id?: string
  type?: string
  data?: Record<string, unknown>
}

interface Props {
  record: RecordShape
}

export const RecordDetailsContent = ({ record }: Props) => {
  if (!record?.type) return null

  switch (record.type) {
    case RECORD_TYPES.LOGIN:
      return <LoginDetailsForm initialRecord={record} />
    case RECORD_TYPES.NOTE:
      return <NoteDetailsForm initialRecord={record} />
    case RECORD_TYPES.CREDIT_CARD:
      return <CreditCardDetailsForm initialRecord={record} />
    case RECORD_TYPES.IDENTITY:
      return <IdentityDetailsForm initialRecord={record} />
    case RECORD_TYPES.WIFI_PASSWORD:
      return <WifiDetailsForm initialRecord={record} />
    case RECORD_TYPES.CUSTOM:
      return <CustomDetailsForm initialRecord={record} />
    case RECORD_TYPES.PASS_PHRASE:
      return <PassPhraseDetailsForm initialRecord={record} />
    default:
      return null
  }
}
