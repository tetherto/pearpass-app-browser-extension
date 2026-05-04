import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { VALID_WORD_COUNTS } from '@tetherto/pearpass-lib-constants'
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
import { Add, TrashOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { FolderDropdownV2 } from '../../../FolderDropdownV2'
import { PassPhraseV2 } from '../../../../../shared/containers/PassPhrase/PassPhraseV2'
import { useGlobalLoading } from '../../../../../shared/context/LoadingContext'
import { useModal } from '../../../../../shared/context/ModalContext'
import { useToast } from '../../../../../shared/context/ToastContext'

type CustomField = { type: string; name?: string; note?: string }

export type CreateOrEditPassPhraseModalContentV2Props = {
  initialRecord?: {
    id?: string
    folder?: string
    isFavorite?: boolean
    type?: string
    data?: {
      title?: string
      passPhrase?: string
      note?: string
      customFields?: CustomField[]
      attachments?: { id: string; name: string }[]
    }
  }
  selectedFolder?: string
  isFavorite?: boolean
}

const parsePassphraseText = (text: string): string[] =>
  text
    .trim()
    .split(/[-\s]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

export const CreateOrEditPassPhraseModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite
}: CreateOrEditPassPhraseModalContentV2Props) => {
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const { theme } = useTheme()

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
    title: Validator.string().required(t`Title is required`),
    passPhrase: Validator.string().required(t`Recovery phrase is required`),
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
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder ?? ''
    },
    validate: (formValues: Record<string, unknown>) => {
      const validationErrors =
        (schema.validate(formValues) as Record<string, string | undefined>) ??
        {}
      const wordCount = parsePassphraseText(
        (formValues.passPhrase as string) ?? ''
      ).length

      if (!wordCount) {
        validationErrors.passPhrase = t`Recovery phrase is required`
      } else if (!(VALID_WORD_COUNTS as number[]).includes(wordCount)) {
        validationErrors.passPhrase = t`Recovery phrase must contain 12 or 24 words`
      }

      return validationErrors
    }
  })

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const titleField = register('title')
  const noteField = register('note')
  const passPhraseField = register('passPhrase')

  const onSubmit = (formValues: Record<string, unknown>) => {
    const data = {
      type: RECORD_TYPES.PASS_PHRASE,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ?? {}),
        title: formValues.title,
        passPhrase: formValues.passPhrase,
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

  return (
    <Dialog
      title={
        isEdit ? t`Edit Recovery Phrase Item` : t`New Recovery Phrase Item`
      }
      onClose={closeModal}
      testID="createoredit-passphrase-dialog-v2"
      closeButtonTestID="createoredit-passphrase-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-passphrase-v2-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={
              isLoading ||
              (!isEdit &&
                (!(values?.title as string)?.trim() ||
                  !(values?.passPhrase as string)?.trim()))
            }
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-passphrase-v2-save"
          >
            {isEdit ? t`Save` : t`Add Item`}
          </Button>
        </div>
      }
    >
      <Form
        testID="createoredit-passphrase-v2-form"
        aria-label={
          isEdit ? t`Edit recovery phrase form` : t`New recovery phrase form`
        }
      >
        <div className="flex flex-col gap-[var(--spacing16)]">
          <InputField
            label={t`Title`}
            placeholder={t`Enter Title`}
            value={titleField.value as string}
            onChange={(e) => titleField.onChange(e.target.value)}
            error={titleField.error || undefined}
            testID="createoredit-passphrase-v2-title"
          />

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Details`}
          </Text>

          <PassPhraseV2
            isCreateOrEdit
            value={passPhraseField.value as string}
            onChange={(val) => setValue('passPhrase', val)}
            error={passPhraseField.error || undefined}
          />

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Additional`}
          </Text>

          <FolderDropdownV2
            selectedFolder={values?.folder as string | undefined}
            onFolderSelect={(name) =>
              setValue('folder', name === values.folder ? '' : name)
            }
            testIDPrefix="createoredit-passphrase-v2-folder"
          />

          <MultiSlotInput testID="createoredit-passphrase-v2-comment-slot">
            <InputField
              label={t`Comment`}
              placeholder={t`Enter Comment`}
              value={noteField.value as string}
              onChange={(e) => noteField.onChange(e.target.value)}
              error={noteField.error || undefined}
              testID="createoredit-passphrase-v2-comment"
            />
          </MultiSlotInput>

          <MultiSlotInput
            testID="createoredit-passphrase-v2-hiddenmessage-slot"
            actions={
              <Button
                variant="tertiaryAccent"
                size="small"
                type="button"
                iconBefore={<Add width={16} height={16} />}
                onClick={() => addCustomField({ type: 'note', note: '' })}
                data-testid="createoredit-passphrase-v2-add-message"
              >
                {t`Add Another Message`}
              </Button>
            }
          >
            {(customFieldsList as Array<{ id: string }>).map((field, index) => {
              const fieldReg = registerCustomFieldItem('note', index)
              return (
                <PasswordField
                  key={field.id}
                  label={t`Hidden Message`}
                  placeholder={t`Enter Hidden Message`}
                  value={fieldReg.value as string}
                  onChange={(e) => fieldReg.onChange(e.target.value)}
                  error={fieldReg.error || undefined}
                  testID={`createoredit-passphrase-v2-hiddenmessage-${index}`}
                  rightSlot={
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
                      data-testid={`createoredit-passphrase-v2-remove-hiddenmessage-${index}`}
                    />
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
