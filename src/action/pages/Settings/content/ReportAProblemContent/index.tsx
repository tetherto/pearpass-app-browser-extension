import { useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'
// prettier-ignore
// @ts-ignore — @tetherto/pear-apps-lib-feedback ships untyped
import { sendGoogleFormFeedback, sendSlackFeedback } from '@tetherto/pear-apps-lib-feedback'
import {
  Button,
  Form,
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
import { useGlobalLoading } from '../../../../../shared/context/LoadingContext'
import { useToast } from '../../../../../shared/context/ToastContext'
import { isOnline } from '../../../../../shared/utils/isOnline'
import { logger } from '../../../../../shared/utils/logger'

const OFFLINE_TIMEOUT = 'OFFLINE_TIMEOUT'
const OFFLINE_TIMEOUT_MS = 10_000

const TEST_IDS = {
  root: 'settings-report-a-problem',
  form: 'settings-report-a-problem-form',
  message: 'settings-report-a-problem-message',
  submit: 'settings-report-a-problem-submit'
} as const

export const ReportAProblemContent = () => {
  const { setToast } = useToast() as {
    setToast: (data: { message: string }) => void
  }
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const handleSend = useCallback(async () => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    try {
      if (!isOnline()) {
        setToast({
          message: t`You are offline, please check your internet connection`
        })
        return
      }

      const nav = navigator as Navigator & {
        userAgentData?: { platform?: string }
      }
      const payload = {
        message: trimmed,
        topic: 'BUG_REPORT' as const,
        app: 'BROWSER_EXTENSION' as const,
        operatingSystem: nav.userAgentData?.platform ?? '',
        deviceModel: nav.platform ?? '',
        appVersion: version
      }

      const sendBoth = async () => {
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
          logger.error(
            'ReportAProblemContent',
            'Error sending Slack feedback:',
            slackResult.reason
          )
        }
        if (googleResult.status === 'rejected') {
          logger.error(
            'ReportAProblemContent',
            'Error sending Google Form feedback:',
            googleResult.reason
          )
        }

        // The senders catch network errors internally and resolve with `false`.
        // Treat any explicit `false` as failure so we don't show "Feedback sent"
        // when the request actually failed (e.g. while offline).
        return (
          (slackResult.status === 'fulfilled' && slackResult.value !== false) ||
          (googleResult.status === 'fulfilled' && googleResult.value !== false)
        )
      }

      const anySucceeded = await Promise.race([
        sendBoth(),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(OFFLINE_TIMEOUT)),
            OFFLINE_TIMEOUT_MS
          )
        })
      ])

      if (anySucceeded) {
        setMessage('')
        setToast({ message: t`Feedback sent` })
      } else {
        // navigator.onLine is unreliable (it can report `true` while offline),
        // so we don't re-check it here. For a feedback POST, "all senders
        // failed" is overwhelmingly a connectivity problem — surface that
        // rather than a generic "Something went wrong".
        setToast({
          message: t`You are offline, please check your internet connection`
        })
      }
    } catch (error) {
      if (error instanceof Error && error.message === OFFLINE_TIMEOUT) {
        setToast({
          message: t`You are offline, please check your internet connection`
        })
      } else {
        setToast({ message: t`Something went wrong, please try again` })
        logger.error('ReportAProblemContent', 'Error sending feedback:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [message, isLoading, setToast])

  const canSend = message.trim().length > 0 && !isLoading

  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`Report a problem`}
        subtitle={t`Please describe the problem you're experiencing. Our team reviews every report to help improve the app.`}
      />

      <Form
        testID={TEST_IDS.form}
        onSubmit={handleSend}
        aria-label={t`Report a problem`}
        noValidate
      >
        <div className="flex flex-col gap-[12px]">
          <TextArea
            testID={TEST_IDS.message}
            label={t`Report a problem`}
            placeholder={t`Write your issue`}
            value={message}
            onChange={setMessage}
            rows={4}
            disabled={isLoading}
          />

          <div className="flex justify-end">
            <Button
              data-testid={TEST_IDS.submit}
              type="submit"
              variant="primary"
              size="small"
              iconBefore={<Send />}
              disabled={!canSend}
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
