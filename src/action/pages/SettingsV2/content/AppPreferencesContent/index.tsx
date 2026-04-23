import { t } from '@lingui/core/macro'
import { PageHeader } from '@tetherto/pearpass-lib-ui-kit'

export const AppPreferencesContent = () => (
  <PageHeader
    as="h1"
    testID="settings-app-preferences"
    title={t`App Preferences`}
    subtitle={t`Control how PearPass works and keep your vault secure.`}
  />
)
