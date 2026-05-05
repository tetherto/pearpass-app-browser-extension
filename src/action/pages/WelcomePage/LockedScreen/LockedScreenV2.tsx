import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useCountDown } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { PageHeader, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { WatchLater } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useUserData } from '@tetherto/pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useRouter } from '../../../../shared/context/RouterContext'

type LockCountdownProps = {
  initialSeconds: number
  onFinish: () => void | Promise<void>
}

const LockCountdown = ({ initialSeconds, onFinish }: LockCountdownProps) => {
  const timeRemaining = useCountDown({ initialSeconds, onFinish })

  return (
    <span
      data-testid="locked-screen-countdown-v2"
      className="text-primary shrink-0 font-medium text-[var(--font-size14)] tabular-nums"
    >
      {timeRemaining}
    </span>
  )
}

export const LockedScreenV2 = () => {
  const { navigate } = useRouter() as {
    navigate: (
      page: string,
      opts?: { params?: Record<string, unknown> }
    ) => void
  }
  const { theme } = useTheme()
  const { masterPasswordStatus, refreshMasterPasswordStatus } = useUserData()

  const onFinish = async () => {
    const status = await refreshMasterPasswordStatus()
    if (!status?.isLocked) {
      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
    }
  }

  const initialSeconds = Math.ceil(
    (masterPasswordStatus?.lockoutRemainingMs ?? 0) / 1000
  )

  const lockoutMinutes =
    initialSeconds > 0 ? Math.ceil(initialSeconds / 60) : null

  return (
    <div
      className="bg-surface-primary flex h-full w-full overflow-hidden"
      data-testid="locked-screen-v2"
    >
      <div className="m-auto flex w-full max-w-[520px] flex-col items-center gap-[var(--spacing24)] px-[var(--spacing24)] py-[var(--spacing16)] text-center">
        <PageHeader
          as="h1"
          title={t`PearPass locked`}
          testID="locked-screen-headline-v2"
        />

        <div className="flex max-w-[420px] flex-col gap-[var(--spacing4)]">
          <Text
            as="p"
            variant="label"
            color={theme.colors.colorTextSecondary}
            data-testid="locked-screen-desc-line1-v2"
          >
            <Trans>Too many failed attempts.</Trans>
          </Text>
          <Text
            as="p"
            variant="label"
            color={theme.colors.colorTextSecondary}
            data-testid="locked-screen-desc-line2-v2"
          >
            {lockoutMinutes
              ? t`For your security, access is locked for ${lockoutMinutes} ${lockoutMinutes === 1 ? 'minute' : 'minutes'}.`
              : t`For your security, access is temporarily locked.`}
          </Text>
        </div>

        <div className="border-border-primary flex w-full max-w-[440px] items-center justify-between rounded-[10px] border px-[var(--spacing8)] py-[var(--spacing10)]">
          <div className="flex min-w-0 items-center gap-[var(--spacing8)]">
            <WatchLater
              width={20}
              height={20}
              color={theme.colors.colorTextSecondary}
            />
            <span
              className="text-text-secondary font-medium text-[var(--font-size14)]"
              data-testid="locked-screen-try-label-v2"
            >
              <Trans>Try again in</Trans>
            </span>
          </div>
          {initialSeconds > 0 ? (
            <LockCountdown
              initialSeconds={initialSeconds}
              onFinish={onFinish}
            />
          ) : (
            <span
              className="text-primary shrink-0 font-medium text-[var(--font-size14)] tabular-nums"
              data-testid="locked-screen-countdown-placeholder-v2"
            >
              —
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
