import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import {
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type CustomRecord = {
  id?: string
  folder?: string
  data?: {
    title?: string
    note?: string
    customFields?: CustomField[]
  }
}

interface Props {
  initialRecord?: CustomRecord
  selectedFolder?: string
}

type FormValues = {
  note: string
  customFields: CustomField[]
  folder?: string
}

export const CustomDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: Props) => {
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
    () => ({
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    }),
    [initialRecord, selectedFolder]
  )

  const { setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const formValues = values as FormValues
  const hasCustomFields = !!formValues.customFields?.length
  const hasNote = !!formValues.note?.length

  if (!hasCustomFields && !hasNote) return null

  return (
    <div className="flex w-full flex-col gap-[var(--spacing8)]">
      <div className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Additional`}
        </Text>

        {hasNote && (
          <MultiSlotInput testID="comments-multi-slot-input">
            <InputField
              label={t`Comment`}
              value={formValues.note}
              placeholder={t`Enter Comment`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="comments-multi-slot-input-slot-0"
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
    </div>
  )
}
