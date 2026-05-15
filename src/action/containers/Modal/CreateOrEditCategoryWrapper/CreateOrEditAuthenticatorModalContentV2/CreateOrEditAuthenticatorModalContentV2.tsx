import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  Combobox,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'
import {
  RECORD_TYPES,
  matchLoginRecords,
  parseOtpInput,
  useCreateRecord,
  useRecords,
  validateOtpInput
} from '@tetherto/pearpass-lib-vault'

import { RecordItemIcon } from '../../../../../shared/containers/RecordItemIcon'
import { useGlobalLoading } from '../../../../../shared/context/LoadingContext'
import { useModal } from '../../../../../shared/context/ModalContext'
import { useToast } from '../../../../../shared/context/ToastContext'

export type CreateOrEditAuthenticatorModalContentV2Props = {
  selectedFolder?: string
  isFavorite?: boolean
  onSaved?: (savedRecordId?: string) => void
}

export const CreateOrEditAuthenticatorModalContentV2 = ({
  selectedFolder,
  isFavorite,
  onSaved
}: CreateOrEditAuthenticatorModalContentV2Props) => {
  const { closeModal } = useModal()
  const { setToast } = useToast()

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: (payload: unknown) => {
      const recordId = (payload as { record?: { id?: string } } | undefined)
        ?.record?.id
      onSaved?.(recordId)
      void closeModal()
      setToast({ message: t`Record created successfully`, icon: null })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      onSaved?.(undefined)
      void closeModal()
      setToast({ message: t`Record updated successfully`, icon: null })
    }
  })

  const { data: loginRecords } = useRecords({
    variables: { filters: { type: RECORD_TYPES.LOGIN } }
  }) as { data?: Array<{ id: string; data?: Record<string, unknown> }> }

  const onError = (error: { message: string }) => {
    setToast({ message: error.message, icon: null })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const schema = useMemo(
    () =>
      Validator.object({
        title: Validator.string().required(t`Title is required`),
        otpSecret: Validator.string().refine(validateOtpInput)
      }),
    []
  )

  const { register, handleSubmit, values, setValue } = useForm({
    initialValues: {
      title: '',
      otpSecret: '',
      linkedRecordId: ''
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const parsedOtp = useMemo(
    () => parseOtpInput(values.otpSecret as string),
    [values.otpSecret]
  )

  const matchedRecords = useMemo(
    () => matchLoginRecords(parsedOtp, loginRecords ?? []),
    [parsedOtp, loginRecords]
  )

  const linkedRecord = useMemo(
    () =>
      values.linkedRecordId
        ? (loginRecords ?? []).find((r) => r.id === values.linkedRecordId)
        : undefined,
    [values.linkedRecordId, loginRecords]
  )

  const parsedEmail =
    typeof parsedOtp?.label === 'string' ? parsedOtp.label : ''

  const onSubmit = (formValues: Record<string, unknown>) => {
    const otpInput = (formValues.otpSecret as string)?.trim() || undefined
    const selectedLinkedRecord = formValues.linkedRecordId
      ? (loginRecords ?? []).find((r) => r.id === formValues.linkedRecordId)
      : undefined

    if (selectedLinkedRecord) {
      updateRecords(
        [
          {
            ...selectedLinkedRecord,
            data: {
              ...(selectedLinkedRecord.data ?? {}),
              otpInput
            }
          }
        ],
        onError
      )
      return
    }

    createRecord(
      {
        type: RECORD_TYPES.LOGIN,
        folder: selectedFolder,
        isFavorite,
        data: {
          title: formValues.title,
          otpInput,
          ...(parsedEmail ? { username: parsedEmail } : {})
        }
      },
      onError
    )
  }

  const [searchQuery, setSearchQuery] = useState('')

  const dropdownRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      return (loginRecords ?? []).filter((r) => {
        const title = ((r.data?.title as string) ?? '').toLowerCase()
        const username = ((r.data?.username as string) ?? '').toLowerCase()
        return title.includes(q) || username.includes(q)
      })
    }
    return matchedRecords.map(({ record }) => record)
  }, [searchQuery, loginRecords, matchedRecords])

  const titleField = register('title')
  const otpSecretField = register('otpSecret')

  const dialogFooter = (
    <div className="flex w-full justify-end gap-[var(--spacing8)]">
      <Button
        variant="secondary"
        size="small"
        type="button"
        onClick={() => void closeModal()}
        data-testid="createoredit-authenticator-v2-discard"
      >
        {t`Discard`}
      </Button>
      <Button
        variant="primary"
        size="small"
        type="button"
        disabled={
          isLoading ||
          (!linkedRecord && !(values.title as string)?.trim()) ||
          !!otpSecretField.error
        }
        isLoading={isLoading}
        onClick={() => handleSubmit(onSubmit)()}
        data-testid="createoredit-authenticator-v2-save"
      >
        {t`Add Item`}
      </Button>
    </div>
  )

  return (
    <Dialog
      title={t`New Authenticator Code Item`}
      onClose={() => void closeModal()}
      testID="createoredit-authenticator-v2-dialog"
      closeButtonTestID="createoredit-authenticator-v2-close"
      footer={dialogFooter}
    >
      <Form
        testID="createoredit-authenticator-v2-form"
        aria-label={t`New authenticator form`}
      >
        <div className="flex flex-col gap-[var(--spacing16)]">
          <InputField
            label={t`Title`}
            placeholder={t`Enter Title`}
            value={
              linkedRecord
                ? ((linkedRecord.data?.title as string) ?? '')
                : (titleField.value as string)
            }
            onChange={(e) => titleField.onChange(e.target.value)}
            error={titleField.error || undefined}
            disabled={!!linkedRecord}
            testID="createoredit-authenticator-v2-title"
          />

          <PasswordField
            label={t`Authenticator Secret Key`}
            placeholder={t`Enter your key or URI`}
            value={otpSecretField.value as string}
            onChange={(e) => otpSecretField.onChange(e.target.value)}
            error={otpSecretField.error || undefined}
            testID="createoredit-authenticator-v2-otpsecret"
          />

          <MultiSlotInput testID="createoredit-authenticator-v2-link-slot">
            <Combobox
              stretch
              label={t`Link to Existing Login`}
              title={t`Change Login Match`}
              value={(linkedRecord?.data?.title as string) ?? ''}
              placeholder={t`No record linked`}
              onClear={() => setValue('linkedRecordId', '')}
              onOpenChange={(open) => {
                if (!open) setSearchQuery('')
              }}
              items={dropdownRecords.map((record) => ({
                id: record.id,
                title: (record.data?.title as string) ?? t`Untitled`,
                subtitle: record.data?.username as string | undefined,
                icon: (
                  <RecordItemIcon
                    record={{ ...record, type: RECORD_TYPES.LOGIN }}
                    size={32}
                  />
                )
              }))}
              selectedId={values.linkedRecordId as string}
              onSelect={(id) => {
                setValue('linkedRecordId', id)
                const rec = (loginRecords ?? []).find((r) => r.id === id)
                setValue('title', (rec?.data?.title as string) ?? '')
              }}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={t`Search...`}
              emptyText={
                searchQuery.trim()
                  ? t`No login items found`
                  : t`No matching login items`
              }
              testID="createoredit-authenticator-v2-link-combobox"
            />
          </MultiSlotInput>
        </div>
      </Form>
    </Dialog>
  )
}
