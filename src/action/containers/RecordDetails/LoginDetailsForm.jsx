import React, { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { isBefore, subtractDateUnits } from 'pear-apps-utils-date'

import { CardWarning } from '../../../shared/components/CardWarningText'
import { CompoundField } from '../../../shared/components/CompoundField'
import { CopyButton } from '../../../shared/components/CopyButton'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { WorldIcon } from '../../../shared/icons/WorldIcon'
import { formatPasskeyDate } from '../../../shared/utils/formatPasskeyDate'
import { isPasswordChangeReminderDisabled } from '../../../shared/utils/isPasswordChangeReminderDisabled'
import { CustomFields } from '../CustomFields'

/**
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} [props.initialRecord.data]
 * @param {string} [props.initialRecord.data.username]
 * @param {string} [props.initialRecord.data.password]
 * @param {string} [props.initialRecord.data.note]
 * @param {Array<{ website: string }>} [props.initialRecord.data.websites]
 * @param {Array<Object>} [props.initialRecord.data.customFields]
 * @param {string} [props.initialRecord.folder]
 *
 */
export const LoginDetailsForm = ({ initialRecord }) => {
  const initialValues = useMemo(
    () => ({
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      credential: initialRecord?.data?.credential ?? undefined,
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt ?? undefined,
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord?.data?.websites.map((website) => ({ website }))
        : [{ name: 'website' }],
      customFields: initialRecord?.data.customFields ?? [],
      folder: initialRecord?.folder
    }),
    [initialRecord]
  )

  const { register, registerArray, setValues, values } = useForm({
    initialValues: initialValues
  })

  const { value: websitesList, registerItem } = registerArray('websites')

  const { value: customFieldsList, registerItem: registerCustomFieldItem } =
    registerArray('customFields')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const isPasswordSixMonthsOld = () => {
    const { passwordUpdatedAt } = initialRecord?.data || {}
    return (
      !!passwordUpdatedAt &&
      isBefore(passwordUpdatedAt, subtractDateUnits(6, 'month'))
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      {!isPasswordChangeReminderDisabled() && isPasswordSixMonthsOld() && (
        <CardWarning
          withJustifyCenter={false}
          text={
            <Trans>
              It’s been 6 months since you last updated this password
              <br />
              Consider changing it to keep your account secure.
            </Trans>
          }
        />
      )}
      <FormGroup>
        {!!values?.username?.length && (
          <InputField
            label={t`Email or username`}
            placeholder={t`Email or username`}
            variant="outline"
            icon={UserIcon}
            readonly
            additionalItems={<CopyButton value={values.username} />}
            {...register('username')}
          />
        )}

        {!!values.password.length && (
          <InputFieldPassword
            label={t`Password`}
            placeholder={t`Password`}
            variant="outline"
            icon={KeyIcon}
            hasStrongness
            readonly
            additionalItems={<CopyButton value={values.password} />}
            {...register('password')}
          />
        )}
        {!!values.credential && (
          <InputField
            label={t`Passkey`}
            value={
              formatPasskeyDate(values?.passkeyCreatedAt) || t`Passkey Stored`
            }
            variant="outline"
            icon={KeyIcon}
            readonly
          />
        )}
      </FormGroup>

      {websitesList.length && (
        <CompoundField>
          {websitesList.map((website, index) => (
            <React.Fragment key={website.id}>
              <InputField
                label={t`Website`}
                placeholder="https://"
                icon={WorldIcon}
                readonly
                additionalItems={
                  <CopyButton value={registerItem('website', index).value} />
                }
                {...registerItem('website', index)}
              />
            </React.Fragment>
          ))}
        </CompoundField>
      )}
      <FormGroup>
        {!!values.note?.length && (
          <InputField
            label={t`Note`}
            placeholder={t`Add note`}
            variant="outline"
            icon={CommonFileIcon}
            readonly
            additionalItems={<CopyButton value={values.note} />}
            {...register('note')}
          />
        )}
      </FormGroup>

      <CustomFields
        areInputsDisabled={true}
        customFields={customFieldsList}
        register={registerCustomFieldItem}
      />
    </div>
  )
}
