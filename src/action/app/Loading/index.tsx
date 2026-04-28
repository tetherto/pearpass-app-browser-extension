import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { PageHeader, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { HourglassBottom } from '@tetherto/pearpass-lib-ui-kit/icons'

export const Loading = () => {
  const { theme } = useTheme()
  const primary = theme.colors.colorTextPrimary

  return (
    <div
      className="bg-surface-primary text-text-primary flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center p-[var(--spacing24)]"
      role="status"
    >
      <div className="mx-auto flex w-full flex-col items-center gap-[var(--spacing6)]">
        <div className="flex items-baseline gap-[var(--spacing6)]">
          <span className="inline-flex shrink-0">
            <HourglassBottom color={primary} height={24} width={24} />
          </span>
          <PageHeader as="h1" title={t`Just a moment...`} />
        </div>
        <Text color={theme.colors.colorTextSecondary}>
          <Trans>
            Connecting to your local vault to sync your latest credentials.
          </Trans>
        </Text>
      </div>
    </div>
  )
}
