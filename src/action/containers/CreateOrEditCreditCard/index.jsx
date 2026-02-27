import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { RECORD_TYPES, useCreateRecord, useRecords } from 'pearpass-lib-vault'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { CalendarIcon } from '../../../shared/icons/CalendarIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CreditCardIcon } from '../../../shared/icons/CreditCardIcon'
import { NineDotsIcon } from '../../../shared/icons/NineDotsIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

export const CreateOrEditCreditCard = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    name: Validator.string(),
    number: Validator.string().numeric(t`Number on card must be a number`),
    expireDate: Validator.string(),
    securityCode: Validator.string().numeric(t`Note must be a string`),
    pinCode: Validator.string().numeric(t`Pin code must be a number`),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(t`Comment is required`)
      })
    ),
    folder: Validator.string()
  })

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: onSave
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: onSave,
    variables: undefined
  })

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const { values, register, handleSubmit, registerArray, setValue } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      name: initialRecord?.data?.name ?? '',
      number: initialRecord?.data?.number ?? '',
      expireDate: initialRecord?.data?.expireDate ?? '',
      securityCode: initialRecord?.data?.securityCode ?? '',
      pinCode: initialRecord?.data?.pinCode ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.CREDIT_CARD,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: values.title,
        name: values.name,
        number: values.number,
        expireDate: values.expireDate,
        securityCode: values.securityCode,
        pinCode: values.pinCode,
        note: values.note,
        customFields: values.customFields,
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (initialRecord && Object.keys(initialRecord).length > 0) {
      updateRecords([{ ...initialRecord, ...data }])
    } else {
      createRecord(data)
    }
  }

  const handleExpireDateChange = (inputValue) => {
    let value = inputValue.replace(/\D/g, '')

    if (value.length > 2) {
      value = `${value.slice(0, 2)} ${value.slice(2, 4)}`
    }

    setValue('expireDate', value)
  }

  const handleNumericInputChange = (value, field) => {
    setValue(field, value.replace(/\D/g, ''))
  }

  return (
    <>
      <FormCategoryHeader
        onSave={handleSubmit(onSubmit)}
        onClose={onClose}
        onFolderChange={(folder) => setValue('folder', folder?.name)}
        initialRecord={initialRecord}
        selectedFolder={values?.folder}
        selectedCategoryType={RECORD_TYPES.CREDIT_CARD}
        isSaveDisabled={isLoading}
      />

      <div className="flex w-full flex-col gap-4 overflow-auto">
        <FormGroup>
          <InputField
            label={t`Title`}
            placeholder={t`Insert title`}
            variant="outline"
            {...register('title')}
          />
        </FormGroup>

        <FormGroup>
          <InputField
            label={t`Full name`}
            placeholder={t`Full name`}
            variant="outline"
            icon={UserIcon}
            {...register('name')}
          />

          <InputField
            label={t`Number on card`}
            placeholder="1234 1234 1234 1234"
            variant="outline"
            icon={CreditCardIcon}
            {...register('number')}
            value={values.number.replace(/(.{4})/g, '$1 ').trim()}
            onChange={(value) => handleNumericInputChange(value, 'number')}
          />

          <InputField
            label={t`Date of expire`}
            placeholder="MM/YY"
            variant="outline"
            icon={CalendarIcon}
            value={values.expireDate}
            onChange={handleExpireDateChange}
          />

          <InputFieldPassword
            label={t`Security code`}
            placeholder="123"
            variant="outline"
            icon={CreditCardIcon}
            {...register('securityCode')}
            onChange={(value) =>
              handleNumericInputChange(value, 'securityCode')
            }
          />

          <InputFieldPassword
            label={t`Pin code`}
            placeholder="1234"
            variant="outline"
            icon={NineDotsIcon}
            {...register('pinCode')}
            onChange={(value) => handleNumericInputChange(value, 'pinCode')}
          />
        </FormGroup>

        <FormGroup>
          <InputField
            label={t`Comment`}
            placeholder={t`Add comment`}
            variant="outline"
            icon={CommonFileIcon}
            {...register('note')}
          />
        </FormGroup>

        <CustomFields
          customFields={list}
          register={registerItem}
          removeItem={removeItem}
        />

        <FormGroup>
          <CreateCustomField
            onCreateCustom={(type) => addItem({ type, name: type })}
          />
        </FormGroup>
      </div>
    </>
  )
}
