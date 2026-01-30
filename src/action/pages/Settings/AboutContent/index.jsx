import { useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  sendGoogleFormFeedback,
  sendSlackFeedback
} from 'pear-apps-lib-feedback'
import { PRIVACY_POLICY, TERMS_OF_USE } from 'pearpass-lib-constants'

import { version } from '../../../../../public/manifest.json'
import { ButtonSecondary } from '../../../../shared/components/ButtonSecondary'
import { CardSingleSetting } from '../../../../shared/components/CardSingleSetting'
import { TextArea } from '../../../../shared/components/TextArea'
import {
  GOOGLE_FORM_KEY,
  GOOGLE_FORM_MAPPING,
  SLACK_WEBHOOK_URL_PATH
} from '../../../../shared/constants/feedback'
import { useToast } from '../../../../shared/context/ToastContext'
import { logger } from '../../../../shared/utils/logger'

export const AboutContent = () => {
  const { setToast } = useToast()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReportProblem = async () => {
    if (!message?.length || isLoading) {
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        message,
        topic: 'BUG_REPORT',
        app: 'BROWSER_EXTENSION',
        operatingSystem: navigator?.userAgentData?.platform,
        deviceModel: navigator?.platform,
        appVersion: version
      }

      await sendSlackFeedback({
        webhookUrPath: SLACK_WEBHOOK_URL_PATH,
        ...payload
      })

      await sendGoogleFormFeedback({
        formKey: GOOGLE_FORM_KEY,
        mapping: GOOGLE_FORM_MAPPING,
        ...payload
      })

      setMessage('')
      setIsLoading(false)

      setToast({
        message: t`Feedback sent`
      })
    } catch (error) {
      setIsLoading(false)

      setToast({
        message: t`Something went wrong, please try again`
      })

      logger.error('Error sending feedback:', error)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <CardSingleSetting title={t`Report a problem`}>
        <p className="font-inter text-grey100-mode1 mb-2 text-[14px] leading-normal">
          {t`Tell us what's going wrong and leave your email so we can follow up with you.`}
        </p>
        <form
          className="flex flex-col gap-[15px]"
          onSubmit={(e) => {
            e.preventDefault()
            handleReportProblem()
          }}
        >
          <TextArea
            value={message}
            onChange={(val) => setMessage(val)}
            variant="report"
            placeholder={t`Write your issue...`}
          />

          <div className="self-start">
            <ButtonSecondary type="submit">{t`Send`}</ButtonSecondary>
          </div>
        </form>
      </CardSingleSetting>

      <CardSingleSetting title={t`PearPass version`}>
        <p className="font-inter text-grey100-mode1 mb-2 text-[14px] leading-normal">
          {t`Here you can find all the info about your app.`}
        </p>
        <div className="flex w-full items-center justify-between text-[14px] text-white">
          <span className="text-grey100-mode1">{t`App version`}</span>
          <span className="text-primary400-mode1 font-bold">{version}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <a
            className="text-primary400-mode1 hover:text-primary300-mode1 text-[14px] underline"
            target="_blank"
            href={TERMS_OF_USE}
          >
            {t`Terms of use`}
          </a>
          <a
            className="text-primary400-mode1 hover:text-primary300-mode1 text-[14px] underline"
            target="_blank"
            href={PRIVACY_POLICY}
          >
            {t`Privacy statement`}
          </a>
        </div>
      </CardSingleSetting>
    </div>
  )
}
