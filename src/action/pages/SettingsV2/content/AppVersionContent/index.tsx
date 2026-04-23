import { t } from '@lingui/core/macro'
import { PageHeader } from '@tetherto/pearpass-lib-ui-kit'

export const AppVersionContent = () => (
  <PageHeader
    as="h1"
    testID="settings-app-version"
    title={t`App version`}
    subtitle={t`Here you can find all the info about your app.`}
  />
)
