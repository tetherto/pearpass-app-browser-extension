import React from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { RECORD_TYPES, useCreateRecord, useRecords } from 'pearpass-lib-vault'

import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { ButtonSingleInput } from '../../../shared/components/ButtonSingleInput'
import { CompoundField } from '../../../shared/components/CompoundField'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { useModal } from '../../../shared/context/ModalContext'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { DeleteIcon } from '../../../shared/icons/DeleteIcon'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { PasswordIcon } from '../../../shared/icons/PasswordIcon'
import { PlusIcon } from '../../../shared/icons/PlusIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { WorldIcon } from '../../../shared/icons/WorldIcon'
import { normalizeUrl } from '../../../shared/utils/normalizeUrl'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

export const CreateOrEditLogin = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const { setModal, closeModal } = useModal()

  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    username: Validator.string(),
    password: Validator.string(),
    note: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website')
      })
    ),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(t`Note is required`)
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
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord.data.websites.map((website) => ({ website }))
        : [{ name: 'website' }],
      customFields: initialRecord?.data?.customFields ?? [],
      folder: selectedFolder ?? initialRecord?.folder
    },
    validate: (values) => schema.validate(values)
  })

  const {
    value: websitesList,
    addItem,
    registerItem,
    removeItem
  } = registerArray('websites')

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.LOGIN,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        title: values.title,
        username: values.username,
        password: values.password,
        credential: initialRecord?.data?.credential,
        note: values.note,
        websites: values.websites
          .filter((website) => !!website?.website?.trim().length)
          .map((website) => normalizeUrl(website.website)),
        customFields: values.customFields,
        passwordUpdatedAt: initialRecord?.data?.passwordUpdatedAt,
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (initialRecord && Object.keys(initialRecord).length > 0) {
      updateRecords([{ ...initialRecord, ...data }])
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
        selectedCategoryType={RECORD_TYPES.LOGIN}
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
            label={t`Email or username`}
            placeholder={t`Email or username`}
            variant="outline"
            icon={UserIcon}
            {...register('username')}
          />

          <InputFieldPassword
            label={t`Password`}
            placeholder={t`Password`}
            variant="outline"
            icon={KeyIcon}
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
          {!!initialRecord?.data?.credential && (
            <InputField
              label={t`Passkey`}
              placeholder={t`Passkey Stored`}
              variant="outline"
              icon={KeyIcon}
              readonly
            />
          )}
        </FormGroup>

        <CompoundField>
          {websitesList.map((website, index) => (
            <React.Fragment key={website.id}>
              <InputField
                label={t`Website`}
                placeholder="https://"
                icon={WorldIcon}
                {...registerItem('website', index)}
                additionalItems={
                  index === 0 ? (
                    <ButtonSingleInput
                      startIcon={PlusIcon}
                      onClick={() => addItem({ name: 'website' })}
                    >
                      {t`Add website`}
                    </ButtonSingleInput>
                  ) : (
                    <ButtonSingleInput
                      startIcon={DeleteIcon}
                      onClick={() => removeItem(index)}
                    >
                      {t`Delete website`}
                    </ButtonSingleInput>
                  )
                }
              />
            </React.Fragment>
          ))}
        </CompoundField>

        <FormGroup>
          <InputField
            label={t`Note`}
            placeholder={t`Add note`}
            variant="outline"
            icon={CommonFileIcon}
            {...register('note')}
          />
        </FormGroup>

        <CustomFields
          customFields={customFieldsList}
          register={registerCustomFieldItem}
          removeItem={removeCustomFieldItem}
        />
        <FormGroup>
          <CreateCustomField
            onCreateCustom={(type) =>
              addCustomField({ type: type, name: type })
            }
          />
        </FormGroup>
      </div>
    </>
  )
}
