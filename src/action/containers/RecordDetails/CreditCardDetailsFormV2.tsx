import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  InputField,
  MultiSlotInput,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type CreditCardRecord = {
  id?: string
  folder?: string
  data?: {
    title?: string
    name?: string
    number?: string
    expireDate?: string
    securityCode?: string
    pinCode?: string
    note?: string
    customFields?: CustomField[]
  }
}

interface Props {
  initialRecord?: CreditCardRecord
  selectedFolder?: string
}

type FormValues = {
  name: string
  number: string
  expireDate: string
  securityCode: string
  pinCode: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const CreditCardDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: Props) => {
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
    () => ({
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const formValues = values as FormValues
  const hasName = !!formValues.name?.length
  const hasNumber = !!formValues.number?.length
  const hasExpireDate = !!formValues.expireDate?.length
  const hasSecurityCode = !!formValues.securityCode?.length
  const hasPinCode = !!formValues.pinCode?.length
  const hasNote = !!formValues.note?.length
  const hasCustomFields = !!formValues.customFields?.length

  const hasCardDetails =
    hasName || hasNumber || hasExpireDate || hasSecurityCode || hasPinCode

  return (
    <div className="flex w-full flex-col gap-[var(--spacing16)]">
      {hasCardDetails && (
        <MultiSlotInput testID="card-details-multi-slot-input">
          {hasName && (
            <InputField
              label={t`Name on card`}
              placeholder={t`John Smith`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('name'))}
            />
          )}

          {hasNumber && (
            <InputField
              label={t`Number on card`}
              placeholder={t`1234 1234 1234 1234`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-1"
              {...toReadOnlyFieldProps(register('number'))}
            />
          )}

          {hasExpireDate && (
            <InputField
              label={t`Date of expire`}
              placeholder={t`MM YY`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-2"
              {...toReadOnlyFieldProps(register('expireDate'))}
            />
          )}

          {hasSecurityCode && (
            <PasswordField
              label={t`Security code`}
              placeholder={t`123`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-3"
              {...toReadOnlyFieldProps(register('securityCode'))}
            />
          )}

          {hasPinCode && (
            <PasswordField
              label={t`Pin code`}
              placeholder={t`1234`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="card-details-multi-slot-input-slot-4"
              {...toReadOnlyFieldProps(register('pinCode'))}
            />
          )}
        </MultiSlotInput>
      )}

      {hasNote && (
        <MultiSlotInput testID="comments-multi-slot-input">
          <InputField
            label={t`Comment`}
            placeholder={t`Add comment`}
            readOnly
            copyable
            onCopy={copyToClipboard}
            isGrouped
            testID="comments-multi-slot-input-slot-0"
            {...toReadOnlyFieldProps(register('note'))}
          />
        </MultiSlotInput>
      )}

      {hasCustomFields && (
        <MultiSlotInput testID="hidden-messages-multi-slot-input">
          {formValues.customFields.map((field, index) => (
            <PasswordField
              key={`${field.type}-${index}`}
              label={t`Hidden Message`}
              value={field.note ?? ''}
              placeholder={t`Enter Hidden Message`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID={`hidden-messages-multi-slot-input-slot-${index}`}
            />
          ))}
        </MultiSlotInput>
      )}
    </div>
  )
}
