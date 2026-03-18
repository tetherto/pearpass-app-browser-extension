import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { useModal } from '../../../shared/context/ModalContext'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { PasswordIcon } from '../../../shared/icons/PasswordIcon'
import { WifiIcon } from '../../../shared/icons/WifiIcon'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

export const CreateOrEditWifi = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const { setModal, closeModal } = useModal()

  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    password: Validator.string().required(t`Password is required`),
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
      password: initialRecord?.data?.password ?? '',
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
      type: RECORD_TYPES.WIFI_PASSWORD,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: values.title,
        password: values.password,
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
        selectedCategoryType={RECORD_TYPES.WIFI_PASSWORD}
        isSaveDisabled={isLoading}
      />

      <div className="flex w-full flex-col gap-4 overflow-auto">
        <FormGroup>
          <InputField
            label={t`WI-FI Name`}
            icon={WifiIcon}
            placeholder={t`Insert WI-FI Name`}
            variant="outline"
            {...register('title')}
          />
        </FormGroup>

        <FormGroup>
          <InputFieldPassword
            label={t`WI-FI Password`}
            placeholder={t`Insert WI-FI Password`}
            variant="outline"
            icon={PasswordIcon}
            hasStrongness
            additionalItems={
              <ButtonRoundIcon
                startIcon={PasswordIcon}
                onClick={() =>
                  setModal(
                    <PasswordGeneratorModalContent
                      actionLabel={t`Insert password`}
                      onActionClick={(value) => {
                        setValue('password', value)
                        closeModal()
                      }}
                      onClose={closeModal}
                    />,
                    {
                      fullScreen: true
                    }
                  )
                }
              />
            }
            {...register('password')}
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
