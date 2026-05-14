import { t } from '@lingui/core/macro'
import { Button, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  formatOtpCode,
  OTP_TYPE,
  useOtp,
  useTimerAnimation
} from '@tetherto/pearpass-lib-vault'
import type { OtpPublic } from '@tetherto/pearpass-lib-vault/src/types'

import { createStyles } from './styles'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

const TIMER_ANIMATION_DURATION = 1000

const useTypedTimerAnimation = useTimerAnimation as (
  timeRemaining: number | null,
  period: number,
  animated?: boolean
) => { noTransition: boolean; expiring: boolean; targetTime: number }

interface OtpCodeFieldV2Props {
  recordId: string
  otpPublic: OtpPublic
  isGrouped?: boolean
  testID?: string
}

export const OtpCodeFieldV2 = ({
  recordId,
  otpPublic,
  isGrouped = false,
  testID
}: OtpCodeFieldV2Props) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { copyToClipboard } = useCopyToClipboard()

  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    { recordId, otpPublic }
  )

  const formattedCode = formatOtpCode(code ?? '')
  const isTOTP = type === OTP_TYPE.TOTP
  const isHOTP = type === OTP_TYPE.HOTP

  const { noTransition, expiring, targetTime } = useTypedTimerAnimation(
    timeRemaining,
    period ?? 30
  )

  const progress =
    timeRemaining !== null && period ? (targetTime / period) * 100 : 0

  const timerColor = expiring
    ? theme.colors.colorTextDestructive
    : theme.colors.colorPrimary

  const cardStyle = isGrouped ? styles.cardGrouped : styles.card

  return (
    <div style={cardStyle} data-testid={testID ?? 'otp-code-field-v2'}>
      <div style={styles.topRow}>
        <div style={styles.innerColumn}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Authenticator Token`}
          </Text>
          <Text variant="labelEmphasized">{formattedCode || ''}</Text>
        </div>
        <Button
          variant="tertiary"
          size="small"
          data-testid="otp-code-field-v2-copy"
          aria-label={t`Copy code`}
          iconBefore={<ContentCopy color={theme.colors.colorTextPrimary} />}
          onClick={() => code && copyToClipboard(code)}
        />
      </div>

      {isTOTP && (
        <div style={styles.timerRow}>
          <div style={styles.timerTrack}>
            <div
              style={{
                ...styles.timerFill,
                background: timerColor,
                width: `${progress}%`,
                transition: noTransition
                  ? 'none'
                  : `width ${TIMER_ANIMATION_DURATION}ms linear`
              }}
            />
          </div>
          <div style={styles.timerLabel}>
            <Text variant="caption" color={timerColor}>
              {timeRemaining !== null ? `${timeRemaining}s` : ''}
            </Text>
          </div>
        </div>
      )}

      {isHOTP && generateNext && (
        <Button
          variant="secondary"
          size="small"
          fullWidth
          disabled={isLoading}
          data-testid="otp-code-field-v2-next-code"
          onClick={generateNext}
        >
          {t`Next Code`}
        </Button>
      )}
    </div>
  )
}
