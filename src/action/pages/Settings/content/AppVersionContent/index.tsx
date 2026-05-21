import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  PEARPASS_WEBSITE,
  PRIVACY_POLICY,
  TERMS_OF_USE
} from '@tetherto/pearpass-lib-constants'
import { Link, PageHeader, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { version } from '../../../../../../public/manifest.json'

const TEST_IDS = {
  root: 'settings-app-version',
  termsLink: 'settings-app-version-terms-link',
  privacyLink: 'settings-app-version-privacy-link',
  websiteLink: 'settings-app-version-website-link',
  versionRow: 'settings-app-version-row',
  versionValue: 'settings-app-version-value'
} as const

export const AppVersionContent = () => {
  const { theme } = useTheme()
  const { colors } = theme

  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`App version`}
        subtitle={
          <Text variant="body" color={colors.colorTextSecondary}>
            <Trans>
              Here you can find all the info about your app. Check here to see
              the{' '}
              <Link
                href={TERMS_OF_USE}
                isExternal
                data-testid={TEST_IDS.termsLink}
              >
                Terms of Use
              </Link>
              ,{' '}
              <Link
                href={PRIVACY_POLICY}
                isExternal
                data-testid={TEST_IDS.privacyLink}
              >
                Privacy Statement
              </Link>{' '}
              and{' '}
              <Link
                href={PEARPASS_WEBSITE}
                isExternal
                data-testid={TEST_IDS.websiteLink}
              >
                visit our website
              </Link>
              .
            </Trans>
          </Text>
        }
      />

      <div
        data-testid={TEST_IDS.versionRow}
        className="border-border-primary flex w-full items-center justify-between rounded-[8px] border px-[12px] py-[16px]"
      >
        <Text variant="labelEmphasized">{t`App version`}</Text>
        <Text
          variant="body"
          color={colors.colorLinkText}
          data-testid={TEST_IDS.versionValue}
        >
          {version}
        </Text>
      </div>
    </div>
  )
}
