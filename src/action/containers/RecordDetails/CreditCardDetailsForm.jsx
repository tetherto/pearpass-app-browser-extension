import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { CalendarIcon } from '../../../shared/icons/CalendarIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
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
  const { setToast } = useToast()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard`,
        icon: CopyIcon
      })
    }
  })

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

  const handleCopy = (value, stripSpaces = false) => {
    if (!value?.length) {
      return
    }

    const textToCopy = stripSpaces ? value.replace(/\s/g, '') : value
    copyToClipboard(textToCopy)
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-auto">
      <FormGroup>
        {!!values?.name?.length && (
          <InputField
            label={t`Full name`}
            placeholder={t`Full name`}
            variant="outline"
            icon={UserIcon}
            onClick={handleCopy}
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
            onClick={() => handleCopy(values.number, true)}
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
            onClick={handleCopy}
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
            onClick={handleCopy}
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
            onClick={handleCopy}
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
            onClick={handleCopy}
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
