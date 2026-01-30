import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { CopyButton } from '../../../shared/components/CopyButton'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { PasswordIcon } from '../../../shared/icons/PasswordIcon'
import { CustomFields } from '../CustomFields'
import { WifiPasswordQRCode } from '../WifiPasswordQRCode'

/**
 *
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} [props.initialRecord.data]
 * @param {string} [props.initialRecord.data.note]
 * @param {Array} [props.initialRecord.data.customFields]
 * @param {string} [props.initialRecord.folder]
 *
 */
export const WifiDetailsForm = ({ initialRecord }) => {
  const initialValues = useMemo(
    () => ({
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: initialRecord?.folder
    }),
    [initialRecord]
  )

  const { register, registerArray, setValues, values } = useForm({
    initialValues: initialValues
  })

  const { value: list, registerItem } = registerArray('customFields')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      <FormGroup>
        {!!values?.password?.length && (
          <InputFieldPassword
            belowInputContent={
              <WifiPasswordQRCode
                ssid={initialRecord?.data?.title}
                password={values?.password}
              />
            }
            label={t`Password`}
            placeholder={t`Password`}
            variant="outline"
            icon={PasswordIcon}
            additionalItems={<CopyButton value={values.password} />}
            readonly
            {...register('password')}
          />
        )}
      </FormGroup>
      <FormGroup>
        {!!values?.note?.length && (
          <InputField
            label={t`Note`}
            placeholder={t`Add note`}
            variant="outline"
            icon={CommonFileIcon}
            additionalItems={<CopyButton value={values.note} />}
            readonly
            {...register('note')}
          />
        )}
      </FormGroup>

      <CustomFields
        areInputsDisabled
        customFields={list}
        register={registerItem}
      />
    </div>
  )
}
