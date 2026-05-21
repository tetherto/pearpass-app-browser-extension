import { useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import {
  Button,
  Dropdown,
  NavbarListItem,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { KeyboardArrowBottom } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useLanguageOptions } from '../../../../../hooks/useLanguageOptions'
import { setLocaleInStorage } from '../../../../../shared/utils/localeStorage'

const TEST_IDS = {
  root: 'settings-language',
  card: 'settings-language-card',
  trigger: 'settings-language-trigger',
  option: 'settings-language-option'
} as const

type LanguageOption = { label: string; value: string }

export const LanguageContent = () => {
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const { colors } = theme
  const { languageOptions } = useLanguageOptions() as {
    languageOptions: LanguageOption[]
  }

  const [language, setLanguage] = useState(i18n.locale)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedOption =
    languageOptions.find((option) => option.value === language) ??
    languageOptions[0]

  const handleSelect = useCallback(
    (option: LanguageOption) => {
      setLanguage(option.value)
      i18n.activate(option.value)
      void setLocaleInStorage(option.value)
      setIsDropdownOpen(false)
    },
    [i18n]
  )

  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`Language`}
        subtitle={t`Choose the language of the app.`}
      />

      <div
        data-testid={TEST_IDS.card}
        className="bg-surface-primary border-border-primary flex items-center gap-[12px] rounded-[8px] border p-[12px]"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <Text variant="labelEmphasized">{t`App Language`}</Text>
          <Text variant="caption" color={colors.colorTextSecondary}>
            {t`Select the language used throughout PearPass.`}
          </Text>
        </div>

        <Dropdown
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
          trigger={
            <Button
              variant="secondary"
              size="small"
              iconAfter={<KeyboardArrowBottom />}
              data-testid={TEST_IDS.trigger}
            >
              {selectedOption?.label ?? t`Select`}
            </Button>
          }
        >
          {languageOptions.map((option) => (
            <NavbarListItem
              key={option.value}
              testID={`${TEST_IDS.option}-${option.value}`}
              label={option.label}
              selected={option.value === language}
              onClick={() => handleSelect(option)}
            />
          ))}
        </Dropdown>
      </div>
    </div>
  )
}
