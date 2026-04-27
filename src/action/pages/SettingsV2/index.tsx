import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ArrowBackOutined,
  BugReportFilled,
  ExpandMore,
  InfoOutlined,
  KeyboardArrowRightFilled,
  PaletteOutlined,
  SecurityFilled,
  SettingsApplicationsFilled,
  SystemSecurityUpdateFilled,
  Translate
} from '@tetherto/pearpass-lib-ui-kit/icons'

import {
  AppPreferencesContent,
  AppVersionContent,
  LanguageContent,
  ReportAProblemContent
} from './content'
import type { Section } from './sections'
import { SettingsItemKey, SettingsSectionKey } from './sections'
import { useRouter } from '../../../shared/context/RouterContext'

const renderActiveContent = (activeItemKey: SettingsItemKey) => {
  switch (activeItemKey) {
    case SettingsItemKey.AppPreferences:
      return <AppPreferencesContent />
    case SettingsItemKey.Language:
      return <LanguageContent />
    case SettingsItemKey.ReportAProblem:
      return <ReportAProblemContent />
    case SettingsItemKey.AppVersion:
      return <AppVersionContent />
    default:
      return null
  }
}

export const SettingsV2 = () => {
  const { navigate } = useRouter()
  const { theme } = useTheme()

  const sections = useMemo<Section[]>(
    () => [
      {
        key: SettingsSectionKey.Security,
        title: t`Security`,
        icon: SecurityFilled,
        items: [
          {
            key: SettingsItemKey.AppPreferences,
            label: t`App Preferences`,
            icon: SettingsApplicationsFilled
          }
        ]
      },
      {
        key: SettingsSectionKey.Appearance,
        title: t`Appearance`,
        icon: PaletteOutlined,
        items: [
          {
            key: SettingsItemKey.Language,
            label: t`Language`,
            icon: Translate
          }
        ]
      },
      {
        key: SettingsSectionKey.About,
        title: t`About`,
        icon: InfoOutlined,
        items: [
          {
            key: SettingsItemKey.ReportAProblem,
            label: t`Report a problem`,
            icon: BugReportFilled
          },
          {
            key: SettingsItemKey.AppVersion,
            label: t`App version`,
            icon: SystemSecurityUpdateFilled
          }
        ]
      }
    ],
    []
  )

  const [activeItemKey, setActiveItemKey] = useState<SettingsItemKey>(
    SettingsItemKey.AppPreferences
  )
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({})

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !(current[sectionKey] ?? true)
    }))
  }

  const handleBack = () => {
    navigate('vault', { params: {} })
  }

  return (
    <div className="bg-background flex h-full w-full flex-col gap-[10px]">
      <header className="flex h-[64px] flex-none items-center gap-[16px] px-[16px] py-[12px]">
        <Button
          variant="tertiary"
          size="small"
          iconBefore={
            <ArrowBackOutined color={theme.colors.colorTextPrimary} />
          }
          onClick={handleBack}
          aria-label={t`Go back`}
          data-testid="settings-back-button"
        />
        <Text variant="bodyEmphasized">
          <Trans>Settings</Trans>
        </Text>
      </header>

      <div className="bg-surface-primary border-border-primary flex min-h-0 flex-1 overflow-hidden rounded-[6px] border">
        <nav
          aria-label={t`Settings sections`}
          className="border-border-primary flex h-full w-[210px] flex-none flex-col gap-[8px] overflow-y-auto border-r p-[12px]"
        >
          {sections.map((section, index) => {
            const SectionIcon = section.icon
            const isExpanded = expandedSections[section.key] ?? true
            const DisclosureIcon = isExpanded
              ? ExpandMore
              : KeyboardArrowRightFilled
            const isLast = index === sections.length - 1

            return (
              <div
                key={section.key}
                className={`flex w-full flex-col gap-[4px] pb-[4px] ${index > 0 ? 'pt-[4px]' : ''} ${isLast ? '' : 'border-border-primary border-b'}`}
              >
                <NavbarListItem
                  testID={`settings-section-${section.key}`}
                  label={section.title}
                  size="small"
                  icon={
                    <>
                      <DisclosureIcon color={theme.colors.colorTextSecondary} />
                      <SectionIcon color={theme.colors.colorTextPrimary} />
                    </>
                  }
                  onClick={() => toggleSection(section.key)}
                />

                {isExpanded && (
                  <div className="border-border-primary ml-[12px] flex flex-col gap-px border-l">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      const selected = activeItemKey === item.key

                      return (
                        <div
                          key={item.key}
                          className="relative overflow-hidden pl-[12px]"
                        >
                          <span
                            aria-hidden
                            className="border-border-primary pointer-events-none absolute top-[10px] left-[-2px] h-[8px] w-[12px] rounded-bl-[12px] border-b border-l"
                          />
                          <div className="overflow-hidden rounded-[8px]">
                            <NavbarListItem
                              testID={`settings-nav-${item.key}`}
                              label={item.label}
                              variant="secondary"
                              size="small"
                              selected={selected}
                              icon={
                                <ItemIcon
                                  color={
                                    selected
                                      ? theme.colors.colorTextPrimary
                                      : theme.colors.colorTextSecondary
                                  }
                                />
                              }
                              onClick={() => setActiveItemKey(item.key)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <main
          className="flex min-w-0 flex-1 flex-col gap-[24px] overflow-y-auto p-[20px]"
          data-testid="settings-content-pane"
        >
          {renderActiveContent(activeItemKey)}
        </main>
      </div>
    </div>
  )
}
