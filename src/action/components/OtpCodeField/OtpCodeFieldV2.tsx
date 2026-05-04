import React from 'react'

import { t } from '@lingui/core/macro'
import { formatOtpCode, OTP_TYPE, useOtp } from '@tetherto/pearpass-lib-vault'
import type { OtpPublic } from '@tetherto/pearpass-lib-vault/src/types'
import { Button, InputField } from '@tetherto/pearpass-lib-ui-kit'
import { LockOutlined, Sync } from '@tetherto/pearpass-lib-ui-kit/icons'

import { TimerBar } from '../../../shared/components/TimerBar'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

interface OtpCodeFieldV2Props {
  recordId: string
  otpPublic: OtpPublic
  testID?: string
}

export const OtpCodeFieldV2 = ({
  recordId,
  otpPublic,
  testID
}: OtpCodeFieldV2Props) => {
  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    { recordId, otpPublic }
  )
  const { copyToClipboard } = useCopyToClipboard()

  const formattedCode = formatOtpCode(code ?? '')
  const isTOTP = type === OTP_TYPE.TOTP
  const hasTimeData = isTOTP && timeRemaining !== null

  return (
    <div className="flex w-full flex-col gap-1">
      <InputField
        testID={testID ?? 'otp-code-field-v2'}
        label={t`Authenticator Token`}
        value={formattedCode}
        readOnly
        leftSlot={<LockOutlined />}
        copyable
        onCopy={() => copyToClipboard(code ?? '')}
        rightSlot={
          type === OTP_TYPE.HOTP && generateNext ? (
            <Button
              variant="tertiaryAccent"
              size="small"
              type="button"
              aria-label={t`Generate next code`}
              iconBefore={<Sync />}
              onClick={generateNext}
              disabled={isLoading}
              data-testid="otp-next-code-button-v2"
            />
          ) : undefined
        }
      />
      {isTOTP && (
        <div
          style={{
            visibility: hasTimeData ? 'visible' : 'hidden',
            width: '100%'
          }}
        >
          <TimerBar timeRemaining={timeRemaining} period={period ?? 0} />
        </div>
      )}
    </div>
  )
}
