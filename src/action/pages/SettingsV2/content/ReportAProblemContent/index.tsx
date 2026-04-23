import { t } from '@lingui/core/macro'
import { PageHeader } from '@tetherto/pearpass-lib-ui-kit'

export const ReportAProblemContent = () => (
  <PageHeader
    as="h1"
    testID="settings-report-a-problem"
    title={t`Report a problem`}
    subtitle={t`Tell us about an issue and we'll take a look.`}
  />
)
