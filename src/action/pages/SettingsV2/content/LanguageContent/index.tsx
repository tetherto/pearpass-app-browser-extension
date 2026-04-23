import { t } from '@lingui/core/macro'
import { PageHeader } from '@tetherto/pearpass-lib-ui-kit'

export const LanguageContent = () => (
  <PageHeader
    as="h1"
    testID="settings-language"
    title={t`Language`}
    subtitle={t`Choose the language used across PearPass.`}
  />
)
