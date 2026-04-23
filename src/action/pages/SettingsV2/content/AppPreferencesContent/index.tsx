import { useCallback, useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import {
  AUTO_LOCK_TIMEOUT_OPTIONS,
  BE_AUTO_LOCK_ENABLED
} from '@tetherto/pearpass-lib-constants'
import {
  Button,
  Dropdown,
  NavbarListItem,
  PageHeader,
  Radio,
  Text,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { KeyboardArrowBottom } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useAutoLockPreferences } from '../../../../../hooks/useAutoLockPreferences'
import {
  LOCAL_STORAGE_KEYS,
  PASSKEY_VERIFICATION_OPTIONS
} from '../../../../../shared/constants/storage'
import { useAllowHttpEnabled } from '../../../../../shared/hooks/useAllowHttpEnabled'
import { useCopyToClipboard } from '../../../../../shared/hooks/useCopyToClipboard'
import {
  getAutofillEnabled,
  setAutofillEnabled
} from '../../../../../shared/utils/autofillSetting'
import { isPasswordChangeReminderDisabled } from '../../../../../shared/utils/isPasswordChangeReminderDisabled'
import { getPasskeyVerificationPreference } from '../../../../../shared/utils/passkeyVerificationPreference'

const TEST_IDS = {
  root: 'settings-app-preferences',
  autofillToggle: 'settings-autofill-toggle',
  allowHttpToggle: 'settings-allow-http-toggle',
  autoLockSelect: 'settings-auto-lock-select',
  autoLockOption: 'settings-auto-lock-option',
  copyToClipboardToggle: 'settings-copy-to-clipboard-toggle',
  remindersToggle: 'settings-reminders-toggle',
  passkeyValidation: 'settings-passkey-validation'
} as const

type TimeoutOption = {
  key: string
  label: string
  value: number | null
}

const TIMEOUT_OPTIONS: TimeoutOption[] = Object.entries(
  AUTO_LOCK_TIMEOUT_OPTIONS as Record<
    string,
    { label: string; value: number | null }
  >
).map(([key, option]) => ({ key, label: option.label, value: option.value }))

export const AppPreferencesContent = () => {
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const { colors } = theme

  const { timeoutMs, setTimeoutMs } = useAutoLockPreferences() as {
    timeoutMs: number | null
    setTimeoutMs: (ms: number | null) => void
  }
  const { isCopyToClipboardEnabled, handleCopyToClipboardSettingChange } =
    useCopyToClipboard()
  const [isAllowHttpEnabled, setIsAllowHttpEnabled] = useAllowHttpEnabled() as [
    boolean,
    (value: boolean) => void
  ]

  const [isAutoLockDropdownOpen, setIsAutoLockDropdownOpen] = useState(false)
  const [isReminderDisabled, setIsReminderDisabled] = useState(() =>
    isPasswordChangeReminderDisabled()
  )
  const [isAutofillEnabled, setIsAutofillEnabledState] = useState(true)
  const [passkeyVerification, setPasskeyVerification] = useState(() =>
    getPasskeyVerificationPreference()
  )

  useEffect(() => {
    let alive = true
    getAutofillEnabled().then((enabled) => {
      if (alive) setIsAutofillEnabledState(enabled)
    })
    return () => {
      alive = false
    }
  }, [])

  const translatedTimeoutOptions = useMemo(
    () =>
      TIMEOUT_OPTIONS.map((option) => ({
        ...option,
        label: i18n._(option.label)
      })),
    [i18n]
  )

  const selectedTimeoutOption = useMemo(
    () =>
      translatedTimeoutOptions.find((option) => option.value === timeoutMs) ??
      translatedTimeoutOptions[0],
    [translatedTimeoutOptions, timeoutMs]
  )

  const handleTimeoutSelect = useCallback(
    (option: TimeoutOption) => {
      setTimeoutMs(option.value)
      setIsAutoLockDropdownOpen(false)
    },
    [setTimeoutMs]
  )

  const handleAutofillToggle = useCallback(
    async (isOn: boolean) => {
      const prev = isAutofillEnabled
      setIsAutofillEnabledState(isOn)
      try {
        await setAutofillEnabled(isOn)
      } catch {
        setIsAutofillEnabledState(prev)
      }
    },
    [isAutofillEnabled]
  )

  const handlePasskeyVerificationChange = useCallback((value: string) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PASSKEY_VERIFICATION_PREFERENCE,
        value
      )
      setPasskeyVerification(value)
    } catch {
      // storage write failed — leave state as-is
    }
  }, [])

  const passkeyOptions = useMemo(
    () => [
      {
        value: PASSKEY_VERIFICATION_OPTIONS.REQUESTED,
        label: t`Requested by website (default)`,
        description: t`Only ask for verification when the website requires it.`
      },
      {
        value: PASSKEY_VERIFICATION_OPTIONS.ALWAYS,
        label: t`Always`,
        description: t`Always require identity verification when using passkeys.`
      },
      {
        value: PASSKEY_VERIFICATION_OPTIONS.NEVER,
        label: t`Never`,
        description: t`Skip identity verification, even if the website requests it.`
      }
    ],
    []
  )

  const handleReminderToggle = useCallback((isOn: boolean) => {
    try {
      if (!isOn) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
          'false'
        )
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED
        )
      }
      setIsReminderDisabled(!isOn)
    } catch {
      // storage write failed — leave state as-is
    }
  }, [])

  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`App Preferences`}
        subtitle={t`Control how PearPass works and keep your vault secure.`}
      />

      <section className="flex flex-col gap-[12px]">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Autofill & Browsing`}
        </Text>
        <div className="bg-surface-primary border-border-primary flex flex-col rounded-[8px] border">
          <div className="flex items-center justify-between gap-[12px] p-[12px]">
            <ToggleSwitch
              data-testid={TEST_IDS.autofillToggle}
              checked={isAutofillEnabled}
              onChange={handleAutofillToggle}
              label={t`Autofill`}
              description={t`Automatically fill usernames, passwords, and codes when you sign in`}
            />
          </div>
          <div className="border-border-primary flex items-center justify-between gap-[12px] border-t p-[12px]">
            <ToggleSwitch
              data-testid={TEST_IDS.allowHttpToggle}
              checked={isAllowHttpEnabled}
              onChange={setIsAllowHttpEnabled}
              label={t`Allow non-secure websites`}
              description={t`Allow autofill and access on HTTP websites. When disabled, only secure HTTPS sites are supported`}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[12px]">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Passkey Preferences`}
        </Text>
        <div className="bg-surface-primary border-border-primary flex flex-col gap-[10px] rounded-[8px] border p-[12px]">
          <div className="flex flex-col gap-[4px]">
            <Text>{t`Passkey Validation`}</Text>
            <Text variant="caption" color={colors.colorTextSecondary}>
              {t`Choose when to verify your identity when using passkeys.`}
            </Text>
          </div>
          <Radio
            testID={TEST_IDS.passkeyValidation}
            value={passkeyVerification}
            onChange={handlePasskeyVerificationChange}
            options={passkeyOptions}
          />
        </div>
      </section>

      <section className="flex flex-col gap-[12px]">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Security Awareness`}
        </Text>
        <div className="bg-surface-primary border-border-primary flex flex-col rounded-[8px] border">
          {BE_AUTO_LOCK_ENABLED && (
            <div className="flex items-center justify-between gap-[12px] p-[12px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <Text variant="labelEmphasized">{t`Auto Lock`}</Text>
                <Text variant="caption" color={colors.colorTextSecondary}>
                  {t`Automatically lock the app after selected period of inactivity`}
                </Text>
              </div>
              <Dropdown
                open={isAutoLockDropdownOpen}
                onOpenChange={setIsAutoLockDropdownOpen}
                trigger={
                  <Button
                    variant="secondary"
                    size="small"
                    iconAfter={<KeyboardArrowBottom />}
                    data-testid={TEST_IDS.autoLockSelect}
                  >
                    {selectedTimeoutOption?.label ?? t`Select a timeout`}
                  </Button>
                }
              >
                {translatedTimeoutOptions.map((option) => (
                  <NavbarListItem
                    key={option.key}
                    testID={`${TEST_IDS.autoLockOption}-${option.key.toLowerCase()}`}
                    label={option.label}
                    selected={option.value === timeoutMs}
                    onClick={() => handleTimeoutSelect(option)}
                  />
                ))}
              </Dropdown>
            </div>
          )}

          <div
            className={
              BE_AUTO_LOCK_ENABLED
                ? 'border-border-primary flex items-center justify-between gap-[12px] border-t p-[12px]'
                : 'flex items-center justify-between gap-[12px] p-[12px]'
            }
          >
            <ToggleSwitch
              data-testid={TEST_IDS.copyToClipboardToggle}
              checked={isCopyToClipboardEnabled}
              onChange={handleCopyToClipboardSettingChange}
              label={t`Copy to Clipboard`}
              description={t`Enable one-tap copying to move your credentials between apps effortlessly.`}
            />
          </div>

          <div className="border-border-primary flex items-center justify-between gap-[12px] border-t p-[12px]">
            <ToggleSwitch
              data-testid={TEST_IDS.remindersToggle}
              checked={!isReminderDisabled}
              onChange={handleReminderToggle}
              label={t`Reminders`}
              description={t`Get alerts when it's time to update your passwords`}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
