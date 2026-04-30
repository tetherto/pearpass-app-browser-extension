import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  InputField,
  MultiSlotInput,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'

import { PassPhraseV2 } from '../../../shared/containers/PassPhrase/PassPhraseV2'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type PassPhraseRecord = {
  id?: string
  folder?: string
  data?: {
    title?: string
    passPhrase?: string
    note?: string
    customFields?: CustomField[]
  }
}

interface Props {
  initialRecord?: PassPhraseRecord
  selectedFolder?: string
}

type FormValues = {
  passPhrase: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const PassPhraseDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: Props) => {
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
    () => ({
      passPhrase: initialRecord?.data?.passPhrase ?? '',
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
  const hasPassPhrase = !!formValues.passPhrase?.length
  const hasNote = !!formValues.note?.length
  const hasCustomFields = !!formValues.customFields?.length

  return (
    <div className="flex w-full flex-col gap-[var(--spacing16)]">
      {hasPassPhrase && <PassPhraseV2 value={formValues.passPhrase} />}

      {hasNote && (
        <MultiSlotInput testID="comments-multi-slot-input">
          <InputField
            label={t`Comment`}
            placeholder={t`Enter Comment`}
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
