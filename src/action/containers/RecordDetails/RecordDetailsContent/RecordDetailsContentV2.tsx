import React from 'react'

import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { CreditCardDetailsFormV2 } from '../CreditCardDetailsFormV2'
import { CustomDetailsFormV2 } from '../CustomDetailsFormV2'
import { IdentityDetailsFormV2 } from '../IdentityDetailsFormV2'
import { LoginDetailsFormV2 } from '../LoginDetailsFormV2'
import { NoteDetailsFormV2 } from '../NoteDetailsFormV2'
import { PassPhraseDetailsFormV2 } from '../PassPhraseDetailsFormV2'
import { WifiDetailsFormV2 } from '../WifiDetailsFormV2'

type RecordShape = {
  id?: string
  type?: string
  data?: Record<string, unknown>
}

interface Props {
  record: RecordShape
}

export const RecordDetailsContentV2 = ({ record }: Props) => {
  if (!record?.type) return null

  switch (record.type) {
    case RECORD_TYPES.LOGIN:
      return <LoginDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.NOTE:
      return <NoteDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.CREDIT_CARD:
      return <CreditCardDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.IDENTITY:
      return <IdentityDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.WIFI_PASSWORD:
      return <WifiDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.CUSTOM:
      return <CustomDetailsFormV2 initialRecord={record} />
    case RECORD_TYPES.PASS_PHRASE:
      return <PassPhraseDetailsFormV2 initialRecord={record} />
    default:
      return null
  }
}
