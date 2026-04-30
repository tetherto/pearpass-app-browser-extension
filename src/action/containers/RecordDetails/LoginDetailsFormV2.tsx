import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { isBefore, subtractDateUnits } from '@tetherto/pear-apps-utils-date'
import {
  AlertMessage,
  Button,
  InputField,
  MultiSlotInput,
  PasswordField,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { OpenInNew } from '@tetherto/pearpass-lib-ui-kit/icons'

import { addHttps } from '../../../shared/utils/addHttps'
import { formatPasskeyDate } from '../../../shared/utils/formatPasskeyDate'
import { isPasswordChangeReminderDisabled } from '../../../shared/utils/isPasswordChangeReminderDisabled'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { OtpCodeFieldV2 } from '../../components/OtpCodeField/OtpCodeFieldV2'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type LoginRecord = {
  id?: string
  folder?: string
  otpPublic?: unknown
  data?: {
    title?: string
    username?: string
    password?: string
    note?: string
    websites?: string[]
    customFields?: CustomField[]
    credential?: { id: string }
    passkeyCreatedAt?: number | string | Date | null
    passwordUpdatedAt?: number | string | Date
  }
}

interface Props {
  initialRecord?: LoginRecord
  selectedFolder?: string
}

type FormValues = {
  username: string
  password: string
  note: string
  websites: string[]
  customFields: CustomField[]
  folder?: string
  credential: string
  passkeyCreatedAt: number | string | Date | null
}

export const LoginDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: Props) => {
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
    () => ({
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites ?? [],
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder,
      credential: initialRecord?.data?.credential?.id ?? '',
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt ?? null
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const formValues = values as FormValues
  const hasUsername = !!formValues.username?.length
  const hasPassword = !!formValues.password?.length
  const hasPasskey = !!formValues.credential
  const hasWebsites = !!formValues.websites?.length
  const hasNote = !!formValues.note?.length
  const hasCustomFields = !!formValues.customFields?.length

  const isPasswordSixMonthsOld = () => {
    const passwordUpdatedAt = initialRecord?.data?.passwordUpdatedAt
    return (
      !!passwordUpdatedAt &&
      isBefore(passwordUpdatedAt, subtractDateUnits(6, 'month'))
    )
  }

  const shouldShowSecurityWarning =
    !isPasswordChangeReminderDisabled() && isPasswordSixMonthsOld()

  return (
    <div className="flex w-full flex-col gap-[var(--spacing16)]">
      <div className="flex flex-col gap-[var(--spacing8)]">
        {(hasUsername || hasPassword) && (
          <MultiSlotInput testID="credentials-multi-slot-input">
            {hasUsername && (
              <InputField
                label={t`Email / Username`}
                placeholder={t`Email / Username`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="credentials-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('username'))}
              />
            )}

            {hasPassword && (
              <PasswordField
                label={t`Password`}
                placeholder={t`Password`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="credentials-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('password'))}
              />
            )}
          </MultiSlotInput>
        )}

        {hasWebsites &&
          formValues.websites.map((website, index) => (
            <MultiSlotInput
              key={`${website}-${index}`}
              testID={`website-multi-slot-input-${index}`}
            >
              <InputField
                label={t`Website`}
                value={website}
                placeholder={t`Enter Website`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID={`website-multi-slot-input-slot-${index}`}
                rightSlot={
                  website?.length ? (
                    <Button
                      variant="tertiary"
                      size="small"
                      type="button"
                      aria-label={t`Open website`}
                      iconBefore={
                        <OpenInNew color={theme.colors.colorTextPrimary} />
                      }
                      onClick={() =>
                        window.open(
                          addHttps(website) as unknown as string,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    />
                  ) : undefined
                }
              />
            </MultiSlotInput>
          ))}

        {!!initialRecord?.otpPublic && !!initialRecord?.id && (
          <MultiSlotInput testID="otp-multi-slot-input">
            <OtpCodeFieldV2
              key={initialRecord.id}
              recordId={initialRecord.id}
              otpPublic={
                initialRecord.otpPublic as Parameters<
                  typeof OtpCodeFieldV2
                >[0]['otpPublic']
              }
            />
          </MultiSlotInput>
        )}

        {hasPasskey && (
          <InputField
            label={t`Passkey`}
            placeholder={t`Passkey`}
            value={
              formatPasskeyDate(formValues.passkeyCreatedAt as number) ||
              t`Passkey Stored`
            }
            readOnly
            testID="passkey-input"
          />
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

      {shouldShowSecurityWarning && (
        <AlertMessage
          variant="error"
          size="big"
          title={t`Password Warning`}
          description={t`It's been 6 months since you last updated this password. Consider changing it to keep your account secure.`}
        />
      )}
    </div>
  )
}
