import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  Form,
  InputField,
  PasswordField,
  Text
} from '@tetherto/pearpass-lib-ui-kit'
import { RECORD_TYPES, useCreateRecord } from '@tetherto/pearpass-lib-vault'

import { CONTENT_MESSAGE_TYPES } from '../../../shared/constants/nativeMessaging'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { RecordItemIcon } from '../../../shared/containers/RecordItemIcon'
import { sanitizeCredentialForPage } from '../../../shared/utils/sanitizeCredentialForPage'
import { formatPasskeyDate } from '../../../shared/utils/formatPasskeyDate'
import { normalizeUrl } from '../../../shared/utils/normalizeUrl'
import { PasskeyContainerV2 } from '../../containers/PasskeyContainer/PasskeyContainerV2'

export const PasskeyLoginCreate = () => {
  const { state: routerState } = useRouter()
  const { passkeyCredential, passkeyCreatedAt, initialData, requestId, tabId } =
    routerState ?? {}

  const { title = '', username = '', websites = [] } = initialData ?? {}

  const handleDiscard = () => {
    chrome.tabs
      .sendMessage(parseInt(tabId), {
        type: CONTENT_MESSAGE_TYPES.SAVED_PASSKEY,
        requestId,
        recordId: null
      })
      .finally(() => {
        window.close()
      })
  }

  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    username: Validator.string(),
    password: Validator.string()
  })

  const { register, handleSubmit } = useForm({
    initialValues: {
      title,
      username,
      password: ''
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const { createRecord, isLoading } = useCreateRecord({
    onCompleted: (payload) => {
      const recordId =
        (payload as { record?: { id?: string } })?.record?.id ?? null
      chrome.tabs
        .sendMessage(parseInt(tabId), {
          type: CONTENT_MESSAGE_TYPES.SAVED_PASSKEY,
          requestId,
          recordId,
          credential: sanitizeCredentialForPage(passkeyCredential)
        })
        .finally(() => {
          window.close()
        })
    }
  })

  useGlobalLoading({ isLoading })

  const titleField = register('title')
  const usernameField = register('username')
  const passwordField = register('password')

  const passkeyDateLabel =
    formatPasskeyDate(passkeyCreatedAt) ?? t`Passkey stored`

  const onSubmit = (formValues: Record<string, unknown>) => {
    const normalizedWebsites = (websites as string[]).map((w) =>
      normalizeUrl(w)
    )

    createRecord(
      {
        type: RECORD_TYPES.LOGIN,
        data: {
          title: formValues.title,
          username: formValues.username,
          password: formValues.password,
          websites: normalizedWebsites,
          credential: passkeyCredential,
          passkeyCreatedAt
        }
      },
      (error: Error) => {
        console.error(
          'Failed to create passkey login:',
          error?.message ?? error
        )
      }
    )
  }

  return (
    <PasskeyContainerV2 title={t`Save Passkey`} onClose={handleDiscard}>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        testID="passkey-login-create-form"
      >
        {/* Scrollable content area */}
        <div className="border-border-primary flex flex-1 flex-col gap-[var(--spacing8)] overflow-auto rounded-[var(--radius16)] border">
          {/* Record icon + site name row */}
          <div className="border-border-primary flex items-center gap-[var(--spacing8)] border-b p-[var(--spacing12)]">
            <RecordItemIcon
              record={{
                type: RECORD_TYPES.LOGIN,
                data: {
                  title: titleField.value || title,
                  websites: websites as string[]
                }
              }}
              size={32}
            />
            <Text variant="labelEmphasized">{titleField.value || title}</Text>
          </div>

          {/* Title field — standalone */}
          <div>
            <InputField
              label={t`Title`}
              value={titleField.value}
              onChange={titleField.onChange}
              error={titleField.error}
              placeholder={t`Title`}
              testID="passkey-login-create-title"
            />

            {/* Email / Username + Password — shared border group */}
            <div className="border-border-primary overflow-hidden rounded-[var(--radius8)] border">
              <div className="border-border-primary border-b">
                <InputField
                  isGrouped
                  label={t`Email / Username`}
                  value={usernameField.value}
                  onChange={usernameField.onChange}
                  error={usernameField.error}
                  placeholder={t`Email / Username`}
                  testID="passkey-login-create-username"
                />
              </div>
              <PasswordField
                isGrouped
                label={t`Password`}
                value={passwordField.value}
                onChange={passwordField.onChange}
                error={passwordField.error}
                placeholder={t`Enter Password`}
                testID="passkey-login-create-password"
              />
            </div>

            {/* Passkey date — read-only */}
            <InputField
              label={t`Passkey`}
              value={passkeyDateLabel}
              onChange={() => {}}
              readOnly
              testID="passkey-login-create-passkey-date"
            />
          </div>
        </div>

        {/* Footer — pinned at bottom with border separator */}
        <div className="border-border-primary mt-[var(--spacing12)] flex gap-[var(--spacing8)] border-t pt-[var(--spacing12)]">
          <Button
            variant="secondary"
            size="medium"
            type="button"
            fullWidth
            data-testid="passkey-login-create-discard-btn"
            onClick={handleDiscard}
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="medium"
            type="submit"
            fullWidth
            isLoading={isLoading}
            data-testid="passkey-login-create-save-btn"
          >
            {t`Save & Add Login`}
          </Button>
        </div>
      </Form>
    </PasskeyContainerV2>
  )
}
