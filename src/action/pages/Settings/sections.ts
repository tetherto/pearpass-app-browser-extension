import type React from 'react'

export enum SettingsItemKey {
  AppPreferences = 'app-preferences',
  YourVaults = 'your-vaults',
  SharedItems = 'shared-items',
  SharedVaults = 'shared-vaults',
  Language = 'language',
  Theme = 'theme',
  ReportAProblem = 'report-a-problem',
  AppVersion = 'app-version'
}

export enum SettingsSectionKey {
  Security = 'security',
  Vault = 'vault',
  SharedElements = 'shared-elements',
  Appearance = 'appearance',
  About = 'about'
}

export type SectionItem = {
  key: SettingsItemKey
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export type Section = {
  key: SettingsSectionKey
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: SectionItem[]
}
