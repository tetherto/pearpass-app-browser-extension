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
import { PassPhrase } from '../../../shared/containers/PassPhrase'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CubeIcon } from '../../../shared/icons/CubeIcon'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

/**
 * @param {{
 *   initialRecord?: {
 *     data?: {
 *       title: string,
 *       passPhrase: string,
 *       note?: string,
 *       customFields?: Array<{note: string}>
 *     },
 *     folder?: string
 *   },
 *   selectedFolder?: string,
 *   onSave: () => void,
 *   onClose: () => void
 * }} props
 */

export const CreateOrEditPassPhrase = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    passPhrase: Validator.string().required(t`Recovery phrase is required`),
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

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      passPhrase: initialRecord?.data?.passPhrase ?? '',
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
      type: RECORD_TYPES.PASS_PHRASE,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: values.title,
        passPhrase: values.passPhrase,
        note: values.note,
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
        selectedCategoryType={RECORD_TYPES.PASS_PHRASE}
        isSaveDisabled={isLoading}
      />

      <div className="flex w-full flex-col gap-4 overflow-auto">
        <FormGroup>
          <InputField
            label={t`Application`}
            icon={CubeIcon}
            placeholder={t`Insert Application name`}
            variant="outline"
            {...register('title')}
          />
        </FormGroup>

        <FormGroup>
          <PassPhrase
            isCreateOrEdit
            onChange={(value) => setValue('passPhrase', value)}
            value={values.passPhrase}
            {...register('passPhrase')}
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
