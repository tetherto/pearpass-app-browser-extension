import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  SyncLock,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { FolderDropdownV2 } from '../../../FolderDropdownV2'
import { useGlobalLoading } from '../../../../../shared/context/LoadingContext'
import { useModal } from '../../../../../shared/context/ModalContext'
import { useToast } from '../../../../../shared/context/ToastContext'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'

type CustomField = { type: string; name?: string; note?: string }

export type CreateOrEditWifiModalContentV2Props = {
  initialRecord?: {
    id?: string
    folder?: string
    isFavorite?: boolean
    type?: string
    data?: {
      title?: string
      password?: string
      note?: string
      customFields?: CustomField[]
      attachments?: { id: string; name: string }[]
    }
  }
  selectedFolder?: string
  isFavorite?: boolean
}

export const CreateOrEditWifiModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite
}: CreateOrEditWifiModalContentV2Props) => {
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const { theme } = useTheme()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const isEdit = !!initialRecord?.id

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      void closeModal()
      setToast({ message: t`Record created successfully`, icon: null })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      void closeModal()
      setToast({ message: t`Record updated successfully`, icon: null })
    }
  })

  const onError = (error: { message: string }) => {
    setToast({ message: error.message, icon: null })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    title: Validator.string().required(t`Name is required`),
    password: Validator.string().required(t`Password is required`),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string()
      })
    ),
    folder: Validator.string()
  })

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      password: initialRecord?.data?.password ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder ?? ''
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const titleField = register('title')
  const passwordField = register('password')
  const noteField = register('note')

  const onSubmit = (formValues: Record<string, unknown>) => {
    const data = {
      type: RECORD_TYPES.WIFI_PASSWORD,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ?? {}),
        title: formValues.title,
        password: formValues.password,
        note: formValues.note,
        customFields: ((formValues.customFields as CustomField[]) ?? []).filter(
          (f) => f.note?.trim().length
        ),
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (isEdit && initialRecord) {
      updateRecords([{ ...initialRecord, ...data }], onError)
    } else {
      createRecord(data, onError)
    }
  }

  const handleGeneratePassword = () => {
    handleCreateOrEditRecord({
      recordType: 'password',
      setValue: (value: string) => setValue('password', value)
    })
  }

  return (
    <Dialog
      title={isEdit ? t`Edit Wi-Fi Item` : t`New Wi-Fi Item`}
      onClose={closeModal}
      testID="createoredit-wifi-dialog-v2"
      closeButtonTestID="createoredit-wifi-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-wifi-v2-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-wifi-v2-save"
          >
            {isEdit ? t`Save` : t`Add Item`}
          </Button>
        </div>
      }
    >
      <Form
        testID="createoredit-wifi-v2-form"
        aria-label={isEdit ? t`Edit Wi-Fi form` : t`New Wi-Fi form`}
      >
        <div className="flex flex-col gap-[var(--spacing16)]">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Credentials`}
          </Text>

          <MultiSlotInput
            testID="createoredit-wifi-v2-credentials-slot"
            actions={
              <Button
                variant="tertiary"
                size="small"
                type="button"
                iconBefore={<SyncLock width={16} height={16} />}
                onClick={handleGeneratePassword}
                data-testid="createoredit-wifi-v2-generate-password"
              >
                {t`Generate Password`}
              </Button>
            }
          >
            <InputField
              label={t`Wi-Fi Name`}
              placeholder={t`Enter Name of Network`}
              value={titleField.value as string}
              onChange={(e) => titleField.onChange(e.target.value)}
              error={titleField.error || undefined}
              testID="createoredit-wifi-v2-name"
            />
            <PasswordField
              label={t`Password`}
              placeholder={t`Enter Password`}
              value={passwordField.value as string}
              onChange={(e) => passwordField.onChange(e.target.value)}
              error={passwordField.error || undefined}
              testID="createoredit-wifi-v2-password"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Additional`}
          </Text>

          <FolderDropdownV2
            selectedFolder={values?.folder as string | undefined}
            onFolderSelect={(name) =>
              setValue('folder', name === values.folder ? '' : name)
            }
            testIDPrefix="createoredit-wifi-v2-folder"
          />

          <InputField
            label={t`Comment`}
            placeholder={t`Enter Comment`}
            value={noteField.value as string}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-wifi-v2-comment"
          />

          <MultiSlotInput
            testID="createoredit-wifi-v2-hiddenmessage-slot"
            actions={
              <Button
                variant="tertiaryAccent"
                size="small"
                type="button"
                iconBefore={<Add width={16} height={16} />}
                onClick={() => addCustomField({ type: 'note', note: '' })}
                data-testid="createoredit-wifi-v2-add-comment"
              >
                {t`Add Another Message`}
              </Button>
            }
          >
            {(customFieldsList as Array<{ id: string }>).map((field, index) => {
              const fieldReg = registerCustomFieldItem('note', index)
              const canRemove =
                (customFieldsList as Array<{ id: string }>).length > 1
              return (
                <PasswordField
                  key={field.id}
                  label={t`Hidden Message`}
                  placeholder={t`Enter Hidden Message`}
                  value={fieldReg.value as string}
                  onChange={(e) => fieldReg.onChange(e.target.value)}
                  error={fieldReg.error || undefined}
                  testID={`createoredit-wifi-v2-hiddenmessage-${index}`}
                  rightSlot={
                    canRemove ? (
                      <Button
                        variant="tertiary"
                        size="small"
                        type="button"
                        aria-label={t`Remove`}
                        iconBefore={
                          <TrashOutlined
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        onClick={() => removeCustomFieldItem(index)}
                        data-testid={`createoredit-wifi-v2-remove-hiddenmessage-${index}`}
                      />
                    ) : undefined
                  }
                />
              )
            })}
          </MultiSlotInput>
        </div>
      </Form>
    </Dialog>
  )
}
