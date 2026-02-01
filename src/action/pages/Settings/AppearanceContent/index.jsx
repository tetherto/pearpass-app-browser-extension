import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { useLanguageOptions } from '../../../../hooks/useLanguageOptions'
import { CardSingleSetting } from '../../../../shared/components/CardSingleSetting'
import { Select } from '../../../../shared/components/Select'

export const AppearanceContent = () => {
  const { i18n } = useLingui()
  const { languageOptions } = useLanguageOptions()

  const [language, setLanguage] = useState(i18n.locale)

  const handleLanguageChange = (selected) => {
    setLanguage(selected.value)
    i18n.activate(selected.value)
  }

  const selectedLangItem = languageOptions.find((l) => l.value === language)

  return (
    <div className="flex w-full flex-col gap-6">
      <CardSingleSetting title={t`Language`}>
        <p className="font-inter text-grey100-mode1 mb-2 text-[14px] leading-normal">
          {t`Choose your preferred language for the app.`}
        </p>
        <Select
          items={languageOptions}
          selectedItem={selectedLangItem}
          onItemSelect={handleLanguageChange}
          placeholder={t`Select`}
        />
      </CardSingleSetting>
    </div>
  )
}
