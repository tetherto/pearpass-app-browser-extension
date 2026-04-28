import { useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'
// prettier-ignore
// @ts-ignore — @tetherto/pear-apps-lib-feedback ships untyped
import { sendGoogleFormFeedback, sendSlackFeedback } from '@tetherto/pear-apps-lib-feedback'
import {
  AlertMessage,
  Button,
  Form,
  InputField,
  PageHeader,
  TextArea
} from '@tetherto/pearpass-lib-ui-kit'
import { Send } from '@tetherto/pearpass-lib-ui-kit/icons'

import { version } from '../../../../../../public/manifest.json'
import {
  GOOGLE_FORM_KEY,
  GOOGLE_FORM_MAPPING,
  SLACK_WEBHOOK_URL_PATH
} from '../../../../../shared/constants/feedback'
import { useToast } from '../../../../../shared/context/ToastContext'
import { logger } from '../../../../../shared/utils/logger'

const TEST_IDS = {
  root: 'settings-report-a-problem',
  form: 'settings-report-a-problem-form',
  message: 'settings-report-a-problem-message',
  email: 'settings-report-a-problem-email',
  alert: 'settings-report-a-problem-alert',
  submit: 'settings-report-a-problem-submit'
} as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (value: string) => EMAIL_REGEX.test(value)

export const ReportAProblemContent = () => {
  const { setToast } = useToast() as {
    setToast: (data: { message: string }) => void
  }
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const trimmedMessage = message.trim()
  const trimmedEmail = email.trim()

  const messageError =
    hasAttemptedSubmit && !trimmedMessage
      ? t`Please describe the issue.`
      : undefined

  const emailError = hasAttemptedSubmit
    ? !trimmedEmail
      ? t`Email is required.`
      : !isValidEmail(trimmedEmail)
        ? t`Enter a valid email address.`
        : undefined
    : undefined

  const isFormValid = !!trimmedMessage && isValidEmail(trimmedEmail)
  const isSubmitDisabled = isLoading || (hasAttemptedSubmit && !isFormValid)

  const handleSubmit = useCallback(async () => {
    if (isLoading) return

    setHasAttemptedSubmit(true)

    if (!trimmedMessage || !isValidEmail(trimmedEmail)) return

    setIsLoading(true)
    try {
      const composedMessage = `${trimmedMessage}\n\nFollow-up email: ${trimmedEmail}`

      const payload = {
        message: composedMessage,
        topic: 'BUG_REPORT' as const,
        app: 'BROWSER_EXTENSION' as const,
        operatingSystem:
          (
            navigator as Navigator & {
              userAgentData?: { platform?: string }
            }
          ).userAgentData?.platform ?? '',
        deviceModel: navigator?.platform ?? '',
        appVersion: version
      }

      const [slackResult, googleResult] = await Promise.allSettled([
        sendSlackFeedback({
          webhookUrPath: SLACK_WEBHOOK_URL_PATH,
          ...payload
        }),
        sendGoogleFormFeedback({
          formKey: GOOGLE_FORM_KEY,
          mapping: GOOGLE_FORM_MAPPING,
          ...payload
        })
      ])

      if (slackResult.status === 'rejected') {
        logger.error('Error sending Slack feedback:', slackResult.reason)
      }
      if (googleResult.status === 'rejected') {
        logger.error('Error sending Google Form feedback:', googleResult.reason)
      }

      const anySucceeded =
        slackResult.status === 'fulfilled' ||
        googleResult.status === 'fulfilled'

      if (anySucceeded) {
        setMessage('')
        setEmail('')
        setHasAttemptedSubmit(false)
        setToast({ message: t`Feedback sent` })
      } else {
        setToast({ message: t`Something went wrong, please try again` })
      }
    } finally {
      setIsLoading(false)
    }
  }, [trimmedMessage, trimmedEmail, isLoading, setToast])

  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`Report a problem`}
        subtitle={t`Tell us what's going wrong and leave your email so we can follow up with you.`}
      />

      <Form
        testID={TEST_IDS.form}
        onSubmit={handleSubmit}
        aria-label={t`Report a problem`}
        noValidate
      >
        <div className="flex flex-col gap-[12px]">
          <TextArea
            testID={TEST_IDS.message}
            label={t`Describe the issue`}
            placeholder={t`Write your issue`}
            value={message}
            onChange={setMessage}
            rows={4}
            disabled={isLoading}
            error={messageError}
          />

          <InputField
            testID={TEST_IDS.email}
            label={t`Email`}
            placeholder={t`Write your email`}
            inputType="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            error={emailError}
          />

          <AlertMessage
            testID={TEST_IDS.alert}
            variant="info"
            size="small"
            title={t`Privacy`}
            description={t`We'll use your email only to follow up with you. It won't be stored or used for anything else.`}
          />

          <div className="flex justify-end">
            <Button
              data-testid={TEST_IDS.submit}
              type="submit"
              variant="primary"
              size="small"
              iconBefore={<Send />}
              disabled={isSubmitDisabled}
              isLoading={isLoading}
            >
              {t`Send`}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
