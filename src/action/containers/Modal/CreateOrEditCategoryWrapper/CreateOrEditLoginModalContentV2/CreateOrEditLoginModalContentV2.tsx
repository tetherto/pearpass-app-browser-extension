import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  Button,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  PasswordField,
  type PasswordIndicatorVariant,
  Text,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { checkPasswordStrength } from '@tetherto/pearpass-utils-password-check'
import {
  Add,
  ArrowBackOutined,
  Close,
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
import { formatPasskeyDate } from '../../../../../shared/utils/formatPasskeyDate'
import { normalizeUrl } from '../../../../../shared/utils/normalizeUrl'
import { useCreateOrEditRecord } from '../../../../hooks/useCreateOrEditRecord'

type Website = { website?: string; name?: string }
type CustomField = { type: string; name: string; note?: string }

const STRENGTH_MAP: Record<string, PasswordIndicatorVariant> = {
  error: 'vulnerable',
  warning: 'decent',
  success: 'strong'
}

export type CreateOrEditLoginModalContentV2Props = {
  initialRecord?: {
    id?: string
    folder?: string
    isFavorite?: boolean
    type?: string
    data?: {
      title?: string
      username?: string
      password?: string
      note?: string
      websites?: string[]
      customFields?: CustomField[]
      otpInput?: string
      otp?: { secret?: string }
      credential?: { id: string }
      passkeyCreatedAt?: number
      passwordUpdatedAt?: number
      attachments?: { id: string; name: string }[]
    }
  }
  selectedFolder?: string
  isFavorite?: boolean
  mode?: 'authenticator'
  onSaved?: (savedRecordId?: string) => void
  fullScreen?: boolean
  onClose?: () => void
}

export const CreateOrEditLoginModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite,
  mode,
  onSaved,
  fullScreen,
  onClose
}: CreateOrEditLoginModalContentV2Props) => {
  const isAuthenticatorMode = mode === 'authenticator'
  const { closeModal } = useModal()
  const handleClose = onClose ?? (() => void closeModal())
  const { setToast } = useToast()
  const { theme } = useTheme()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const isEdit = !!initialRecord?.id

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
      onSaved?.(initialRecord?.id)
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
    username: Validator.string(),
    password: Validator.string(),
    otpSecret: Validator.string(),
    note: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website(t`Wrong format of website`)
      })
    ),
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
      username: initialRecord?.data?.username ?? '',
      password: initialRecord?.data?.password ?? '',
      otpSecret:
        initialRecord?.data?.otpInput ?? initialRecord?.data?.otp?.secret ?? '',
      note: initialRecord?.data?.note ?? '',
      websites: initialRecord?.data?.websites?.length
        ? initialRecord.data.websites.map((website: string) => ({ website }))
        : [{ website: '' }],
      customFields: initialRecord?.data?.customFields?.length
        ? initialRecord.data.customFields
        : [{ type: 'note', name: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder ?? '',
      credential: initialRecord?.data?.credential?.id ?? '',
      passkeyCreatedAt: initialRecord?.data?.passkeyCreatedAt
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const {
    value: websitesList,
    addItem: addWebsite,
    registerItem: registerWebsiteItem,
    removeItem: removeWebsite
  } = registerArray('websites')

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const titleField = register('title')
  const usernameField = register('username')
  const passwordField = register('password')
  const otpSecretField = register('otpSecret')
  const noteField = register('note')

  const passwordIndicator = useMemo<
    PasswordIndicatorVariant | undefined
  >(() => {
    const value = passwordField.value as string
    if (!value?.length) return undefined
    const result = checkPasswordStrength(value) as unknown as {
      strengthType: string
    }
    return STRENGTH_MAP[result.strengthType]
  }, [passwordField.value])

  const onSubmit = (formValues: Record<string, unknown>) => {
    const otpInput = ((formValues.otpSecret as string)?.trim() || undefined) as
      | string
      | undefined

    const data = {
      type: RECORD_TYPES.LOGIN,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ?? {}),
        title: formValues.title,
        username: formValues.username,
        password: formValues.password,
        note: formValues.note,
        websites: (formValues.websites as Website[])
          .filter((website) => !!website?.website?.trim().length)
          .map((website) => normalizeUrl(website.website as string)),
        customFields: ((formValues.customFields as CustomField[]) ?? []).filter(
          (f) => f.note?.trim().length
        ),
        passwordUpdatedAt: initialRecord?.data?.passwordUpdatedAt,
        attachments: initialRecord?.data?.attachments ?? [],
        otpInput
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

  const dialogTitle = isAuthenticatorMode
    ? isEdit
      ? t`Edit Authenticator Code Item`
      : t`New Authenticator Code Item`
    : isEdit
      ? t`Edit Login Item`
      : t`New Login Item`

  const dialogFooter = (
    <div className="flex w-full justify-end gap-[var(--spacing8)]">
      <Button
        variant="secondary"
        size="small"
        type="button"
        onClick={handleClose}
        data-testid="createoredit-login-v2-discard"
      >
        {t`Discard`}
      </Button>
      <Button
        variant="primary"
        size="small"
        type="button"
        disabled={isLoading || (!isEdit && !(values?.title as string)?.trim())}
        isLoading={isLoading}
        onClick={() => handleSubmit(onSubmit)()}
        data-testid="createoredit-login-v2-save"
      >
        {isEdit ? t`Save` : t`Add Item`}
      </Button>
    </div>
  )

  const renderBody = () => (
    <Form
      testID="createoredit-login-v2-form"
      aria-label={isEdit ? t`Edit login form` : t`New login form`}
    >
      <div className="flex flex-col gap-[var(--spacing16)]">
        <InputField
          label={t`Title`}
          placeholder={t`Enter Title`}
          value={titleField.value as string}
          onChange={(e) => titleField.onChange(e.target.value)}
          error={titleField.error || undefined}
          testID="createoredit-login-v2-title"
        />

        {!isAuthenticatorMode ? (
          <>
            <Text variant="caption" color={theme.colors.colorTextSecondary}>
              {t`Credentials`}
            </Text>

            <MultiSlotInput
              testID="createoredit-login-v2-credentials-slot"
              actions={
                <Button
                  variant="tertiaryAccent"
                  size="small"
                  type="button"
                  iconBefore={<SyncLock width={16} height={16} />}
                  onClick={handleGeneratePassword}
                  data-testid="createoredit-login-v2-generate-password"
                >
                  {t`Generate Password`}
                </Button>
              }
            >
              <InputField
                label={t`Email / Username`}
                placeholder={t`Enter Email / Username`}
                value={usernameField.value as string}
                onChange={(e) => usernameField.onChange(e.target.value)}
                error={usernameField.error || undefined}
                testID="createoredit-login-v2-username"
              />
              <PasswordField
                label={t`Password`}
                placeholder={t`Enter Password`}
                value={passwordField.value as string}
                onChange={(e) => passwordField.onChange(e.target.value)}
                error={passwordField.error || undefined}
                passwordIndicator={passwordIndicator}
                testID="createoredit-login-v2-password"
              />
            </MultiSlotInput>
          </>
        ) : null}

        {AUTHENTICATOR_ENABLED || isAuthenticatorMode ? (
          <MultiSlotInput testID="createoredit-login-v2-authenticator-slot">
            <PasswordField
              label={t`Authenticator Secret Key`}
              placeholder={t`Enter Secret Key (TOTP)`}
              value={otpSecretField.value as string}
              onChange={(e) => otpSecretField.onChange(e.target.value)}
              error={otpSecretField.error || undefined}
              testID="createoredit-login-v2-otpsecret"
              rightSlot={
                isEdit && (otpSecretField.value as string)?.length ? (
                  <Button
                    variant="tertiaryAccent"
                    size="small"
                    type="button"
                    aria-label={t`Remove authenticator code`}
                    iconBefore={
                      <Close
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={() => otpSecretField.onChange('')}
                    data-testid="createoredit-login-v2-remove-otpsecret"
                  />
                ) : undefined
              }
            />
          </MultiSlotInput>
        ) : null}

        {!isAuthenticatorMode && values?.credential ? (
          <InputField
            label={t`Passkey`}
            value={
              formatPasskeyDate(values.passkeyCreatedAt as number) ||
              t`Passkey Stored`
            }
            placeholder=""
            disabled
            testID="createoredit-login-v2-passkey"
          />
        ) : null}

        {!isAuthenticatorMode ? (
          <>
            <Text variant="caption" color={theme.colors.colorTextSecondary}>
              {t`Details`}
            </Text>

            <MultiSlotInput
              testID="createoredit-login-v2-websites-slot"
              actions={
                <Button
                  variant="tertiaryAccent"
                  size="small"
                  type="button"
                  iconBefore={<Add width={16} height={16} />}
                  onClick={() => addWebsite({ name: 'website' })}
                  data-testid="createoredit-login-v2-add-website"
                >
                  {t`Add Another Website`}
                </Button>
              }
            >
              {(websitesList as Array<{ id: string }>).map((website, index) => {
                const websiteField = registerWebsiteItem('website', index)
                return (
                  <InputField
                    key={website.id}
                    label={t`Website`}
                    placeholder={t`Enter Website`}
                    value={websiteField.value as string}
                    onChange={(e) => websiteField.onChange(e.target.value)}
                    error={websiteField.error || undefined}
                    testID={`createoredit-login-v2-website-${index}`}
                    rightSlot={
                      index > 0 ? (
                        <Button
                          variant="tertiaryAccent"
                          size="small"
                          type="button"
                          aria-label={t`Remove website`}
                          iconBefore={
                            <TrashOutlined
                              width={16}
                              height={16}
                              color={theme.colors.colorTextPrimary}
                            />
                          }
                          onClick={() => removeWebsite(index)}
                          data-testid={`createoredit-login-v2-remove-website-${index}`}
                        />
                      ) : undefined
                    }
                  />
                )
              })}
            </MultiSlotInput>

            <FolderDropdownV2
              selectedFolder={values?.folder as string | undefined}
              onFolderSelect={(name) =>
                setValue('folder', name === values.folder ? '' : name)
              }
              testIDPrefix="createoredit-login-v2-folder"
            />
          </>
        ) : null}

        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Additional`}
        </Text>

        <MultiSlotInput testID="createoredit-login-v2-comment-slot">
          <InputField
            label={t`Comment`}
            placeholder={t`Enter Comment`}
            value={noteField.value as string}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-login-v2-comment"
          />
        </MultiSlotInput>

        {!isAuthenticatorMode ? (
          <MultiSlotInput
            testID="createoredit-login-v2-hiddenmessages-slot"
            actions={
              <Button
                variant="tertiaryAccent"
                size="small"
                type="button"
                iconBefore={<Add width={16} height={16} />}
                onClick={() =>
                  addCustomField({ type: 'note', name: 'note', note: '' })
                }
                data-testid="createoredit-login-v2-add-comment"
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
                  testID={`createoredit-login-v2-hiddenmessage-${index}`}
                  rightSlot={
                    canRemove ? (
                      <Button
                        variant="tertiaryAccent"
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
                        data-testid={`createoredit-login-v2-remove-hiddenmessage-${index}`}
                      />
                    ) : undefined
                  }
                />
              )
            })}
          </MultiSlotInput>
        ) : null}
      </div>
    </Form>
  )

  if (fullScreen) {
    return (
      <div
        data-testid="createoredit-login-fullscreen-v2"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.colorSurfacePrimary
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${rawTokens.spacing12}px`,
            paddingBlock: `${rawTokens.spacing12}px`,
            paddingInline: `${rawTokens.spacing16}px`,
            borderBottom: `1px solid ${theme.colors.colorBorderPrimary}`,
            flexShrink: 0
          }}
        >
          <Button
            variant="tertiary"
            size="small"
            type="button"
            aria-label={t`Back`}
            iconBefore={
              <ArrowBackOutined color={theme.colors.colorTextPrimary} />
            }
            onClick={handleClose}
            data-testid="createoredit-login-v2-back"
          />
          <div style={{ flex: 1 }}>
            <Text>{dialogTitle}</Text>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${rawTokens.spacing16}px`
          }}
        >
          {renderBody()}
        </div>
        <div
          style={{
            paddingBlock: `${rawTokens.spacing12}px`,
            paddingInline: `${rawTokens.spacing16}px`,
            borderTop: `1px solid ${theme.colors.colorBorderPrimary}`,
            flexShrink: 0
          }}
        >
          {dialogFooter}
        </div>
      </div>
    )
  }

  return (
    <Dialog
      title={dialogTitle}
      onClose={handleClose}
      testID="createoredit-login-dialog-v2"
      closeButtonTestID="createoredit-login-close-v2"
      footer={dialogFooter}
    >
      {renderBody()}
    </Dialog>
  )
}
