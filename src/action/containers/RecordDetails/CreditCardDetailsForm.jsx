import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { CopyButton } from '../../../shared/components/CopyButton'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { CalendarIcon } from '../../../shared/icons/CalendarIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CreditCardIcon } from '../../../shared/icons/CreditCardIcon'
import { NineDotsIcon } from '../../../shared/icons/NineDotsIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { CustomFields } from '../CustomFields'

/**
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} [props.initialRecord.data]
 * @param {string} [props.initialRecord.data.name]
 * @param {string} [props.initialRecord.data.number]
 * @param {string} [props.initialRecord.data.expireDate]
 * @param {string} [props.initialRecord.data.securityCode]
 * @param {string} [props.initialRecord.data.pinCode]
 * @param {string} [props.initialRecord.data.note]
 * @param {Array} [props.initialRecord.data.customFields]
 * @param {Object} [props.initialRecord.folder]
 */
export const CreditCardDetailsForm = ({ initialRecord }) => {
  const initialValues = useMemo(
    () => ({
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: initialRecord?.folder
    }),
    [initialRecord]
  )

  const { register, registerArray, setValues, values } = useForm({
    initialValues: initialValues
  })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const { value: list, registerItem } = registerArray('customFields')

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-auto">
      <FormGroup>
        {!!values?.name?.length && (
          <InputField
            label={t`Full name`}
            placeholder={t`Full name`}
            variant="outline"
            icon={UserIcon}
            additionalItems={<CopyButton value={values.name} />}
            readonly
            {...register('name')}
          />
        )}
        {!!values?.number?.length && (
          <InputField
            label={t`Number on card`}
            placeholder="1234 1234 1234 1234"
            variant="outline"
            icon={CreditCardIcon}
            additionalItems={
              <CopyButton value={values.number.replace(/\s/g, '')} />
            }
            readonly
            {...register('number')}
            value={values.number.replace(/(.{4})/g, '$1 ').trim()}
          />
        )}

        {!!values?.expireDate?.length && (
          <InputField
            label={t`Date of expire`}
            placeholder="MM/YY"
            variant="outline"
            icon={CalendarIcon}
            additionalItems={<CopyButton value={values.expireDate} />}
            readonly
            {...register('expireDate')}
          />
        )}

        {!!values?.securityCode?.length && (
          <InputFieldPassword
            label={t`Security code`}
            placeholder="123"
            variant="outline"
            icon={CreditCardIcon}
            additionalItems={<CopyButton value={values.securityCode} />}
            readonly
            {...register('securityCode')}
          />
        )}
        {!!values?.pinCode?.length && (
          <InputFieldPassword
            label={t`Pin code`}
            placeholder="1234"
            variant="outline"
            icon={NineDotsIcon}
            additionalItems={<CopyButton value={values.pinCode} />}
            readonly
            {...register('pinCode')}
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
        areInputsDisabled={true}
        customFields={list}
        register={registerItem}
      />
    </div>
  )
}
