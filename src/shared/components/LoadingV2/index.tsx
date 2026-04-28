import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react'
import { PageHeader, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { HourglassBottom } from '@tetherto/pearpass-lib-ui-kit/icons'

export const LoadingV2 = () => {
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const primary = theme.colors.colorTextPrimary

  return (
    <div
      className="bg-surface-primary text-text-primary flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center p-6"
      role="status"
    >
      <div className="mx-auto flex w-full flex-col items-center gap-[6px]">
        <div className="flex items-center gap-[6px]">
          <div className="mb-[7px] flex items-center">
            <HourglassBottom color={primary} height={24} width={24} />
          </div>
          <PageHeader as="h1" title={i18n._(t`Just a moment...`)} />
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
