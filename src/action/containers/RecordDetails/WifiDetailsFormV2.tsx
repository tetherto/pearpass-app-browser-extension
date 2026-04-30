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
import { WifiPasswordQRCodeV2 } from '../WifiPasswordQRCode/WifiPasswordQRCodeV2'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type WifiRecord = {
  id?: string
  folder?: string
  data?: {
    title?: string
    password?: string
    note?: string
    customFields?: CustomField[]
  }
}

interface Props {
  initialRecord?: WifiRecord
  selectedFolder?: string
}

type FormValues = {
  title: string
  password: string
  note: string
  customFields: CustomField[]
  folder?: string
}

export const WifiDetailsFormV2 = ({ initialRecord, selectedFolder }: Props) => {
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
    () => ({
      title: initialRecord?.data?.title ?? '',
      password: initialRecord?.data?.password ?? '',
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
  const hasPassword = !!formValues.password?.length
  const hasNote = !!formValues.note?.length
  const hasCustomFields = !!formValues.customFields?.length

  return (
    <div className="flex w-full flex-col gap-[var(--spacing8)]">
      {hasPassword && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Credentials`}
          </Text>

          <MultiSlotInput testID="credentials-multi-slot-input">
            <PasswordField
              label={t`Wi-Fi Password`}
              placeholder={t`Insert Wi-Fi Password`}
              readOnly
              copyable
              onCopy={copyToClipboard}
              isGrouped
              testID="credentials-multi-slot-input-slot-0"
              {...toReadOnlyFieldProps(register('password'))}
            />
            <WifiPasswordQRCodeV2
              ssid={formValues.title}
              password={formValues.password}
            />
          </MultiSlotInput>
        </div>
      )}

      {(hasNote || hasCustomFields) && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Additional`}
          </Text>

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
      )}
    </div>
  )
}
