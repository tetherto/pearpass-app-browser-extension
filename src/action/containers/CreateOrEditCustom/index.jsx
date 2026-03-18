import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

export const CreateOrEditCustom = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
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

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: initialRecord?.data?.title || '',
      customFields: initialRecord?.data?.customFields || [],
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
      type: RECORD_TYPES.CUSTOM,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: values.title,
        customFields: values.customFields,
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (initialRecord && Object.keys(initialRecord).length > 0) {
      updateRecords([
        {
          ...initialRecord,
          ...data
        }
      ])
    } else {
      createRecord(data)
    }
  }

  return (
    <>
      <FormCategoryHeader
        onSave={handleSubmit(onSubmit)}
        onClose={onClose}
        onFolderChange={(folder) => setValue('folder', folder?.name)}
        initialRecord={initialRecord}
        selectedFolder={values?.folder}
        selectedCategoryType={RECORD_TYPES.CUSTOM}
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

        <CustomFields
          customFields={list}
          register={registerItem}
          removeItem={removeItem}
        />

        <FormGroup>
          <CreateCustomField
            onCreateCustom={(type) => addItem({ type: type, name: type })}
          />
        </FormGroup>
      </div>
    </>
  )
}
