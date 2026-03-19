import React from 'react'

import { t } from '@lingui/core/macro'
import { formatOtpCode, OTP_TYPE, useOtp } from '@tetherto/pearpass-lib-vault'
import type { OtpPublic } from '@tetherto/pearpass-lib-vault/src/types'

import { CopyButton } from '../CopyButton'
import { InputField } from '../InputField'
import { TimerBar } from '../TimerBar'
import { LockIcon } from '../../icons/LockIcon'

interface OtpCodeFieldProps {
  recordId: string
  otpPublic: OtpPublic
  testId?: string
}

export const OtpCodeField = ({
  recordId,
  otpPublic,
  testId
}: OtpCodeFieldProps) => {
  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    {
      recordId,
      otpPublic
    }
  )

  const formattedCode = formatOtpCode(code)
  const isTOTP = type === OTP_TYPE.TOTP
  const hasTimeData = isTOTP && timeRemaining !== null

  const timerBar = isTOTP ? (
    <div
      style={{
        visibility: hasTimeData ? 'visible' : 'hidden',
        width: '100%'
      }}
    >
      <TimerBar timeRemaining={timeRemaining} period={period} />
    </div>
  ) : null

  return (
    <InputField
      testId={testId || 'otp-code-field'}
      label={t`Authenticator Token`}
      value={formattedCode}
      variant="outline"
      icon={LockIcon}
      readonly
      belowInputContent={timerBar}
      additionalItems={
        <div className="flex items-center gap-2">
          {type === OTP_TYPE.HOTP && generateNext && (
            <button
              onClick={generateNext}
              disabled={isLoading}
              className="border-grey100-mode1 text-white-mode1 hover:border-primary400-mode1 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t`Next Code`}
            </button>
          )}
          <CopyButton value={code} />
        </div>
      }
    />
  )
}
