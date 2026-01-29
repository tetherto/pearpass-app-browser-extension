import { useState, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import {
  AUTO_LOCK_TIMEOUT_OPTIONS,
  BE_AUTO_LOCK_ENABLED
} from 'pearpass-lib-constants'

import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { CardSingleSetting } from '../../../../shared/components/CardSingleSetting'
import { RadioOption } from '../../../../shared/components/RadioOption'
import { Select } from '../../../../shared/components/Select'
import { SwitchWithLabel } from '../../../../shared/components/SwitchWithLabel'
import {
  LOCAL_STORAGE_KEYS,
  PASSKEY_VERIFICATION_OPTIONS
} from '../../../../shared/constants/storage'
import { useAllowHttpEnabled } from '../../../../shared/hooks/useAllowHttpEnabled'
import { useCopyToClipboard } from '../../../../shared/hooks/useCopyToClipboard'
import { isPasswordChangeReminderDisabled } from '../../../../shared/utils/isPasswordChangeReminderDisabled'
import { getPasskeyVerificationPreference } from '../../../../shared/utils/passkeyVerificationPreference'

const TIMEOUT_OPTIONS = Object.values(AUTO_LOCK_TIMEOUT_OPTIONS)

export const SecurityContent = () => {
  const { i18n } = useLingui()
  const translatedOptions = useMemo(
    () => TIMEOUT_OPTIONS.map((o) => ({ ...o, label: i18n._(o.label) })),
    [i18n]
  )

  const [isPasswordReminderEnabled, setIsPasswordReminderEnabled] = useState(
    !isPasswordChangeReminderDisabled()
  )
  const [passkeyVerification, setPasskeyVerification] = useState(
    getPasskeyVerificationPreference()
  )

  const { isAutoLockEnabled, timeoutMs, setAutoLockEnabled, setTimeoutMs } =
    useAutoLockPreferences()

  const { isCopyToClipboardEnabled, handleCopyToClipboardSettingChange } =
    useCopyToClipboard()

  const [isAllowHttpEnabled, setIsAllowHttpEnabled] = useAllowHttpEnabled()

  const handlePasswordChangeReminder = (isEnabled) => {
    try {
      if (!isEnabled) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
          'false'
        )
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED
        )
      }
      setIsPasswordReminderEnabled(isEnabled)
    } catch (e) {}
  }

  const handlePasskeyVerificationChange = (value) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PASSKEY_VERIFICATION_PREFERENCE,
        value
      )
      setPasskeyVerification(value)
    } catch (e) {}
  }

  const selectedTimeoutOption =
    translatedOptions.find((option) => option.value === timeoutMs) ??
    translatedOptions[0] ??
    null

  return (
    <div className="flex w-full flex-col gap-6">
      <CardSingleSetting title={t`PearPass functions`}>
        <p className="font-inter text-grey100-mode1 mb-2 text-[14px] leading-normal">
          {t`Control how PearPass works and keep your vault secure.`}
        </p>
        <div className="flex flex-col gap-[10px]">
          <SwitchWithLabel
            isOn={isPasswordReminderEnabled}
            label={t`Reminders`}
            description={t`Get alerts when it's time to update your passwords.`}
            onChange={handlePasswordChangeReminder}
          />
          <SwitchWithLabel
            isOn={isCopyToClipboardEnabled}
            label={t`Copy to clipboard`}
            description={t`Copy any password instantly with one tap.`}
            onChange={handleCopyToClipboardSettingChange}
          />
          <SwitchWithLabel
            isOn={isAllowHttpEnabled}
            label={t`Allow non-secure websites`}
            description={t`Allow access to HTTP websites. When off, only HTTPS is allowed.`}
            onChange={setIsAllowHttpEnabled}
          />
          {BE_AUTO_LOCK_ENABLED && (
            <div className="flex flex-col gap-0.5">
              <SwitchWithLabel
                isOn={isAutoLockEnabled}
                label={t`Auto Log-out`}
                description={t`Automatically logs you out after you stop interacting with the app, based on the timeout you select.`}
                onChange={setAutoLockEnabled}
              />
              {isAutoLockEnabled && (
                <Select
                  items={translatedOptions}
                  selectedItem={selectedTimeoutOption}
                  onItemSelect={(option) => setTimeoutMs(option.value)}
                  placeholder={t`Select`}
                />
              )}
            </div>
          )}
        </div>
      </CardSingleSetting>

      <CardSingleSetting title={t`Passkey verification`}>
        <div className="flex flex-col gap-[15px]">
          <p className="font-inter text-grey100-mode1 text-[14px] leading-normal">
            {t`Choose when to verify your identity when using passkeys.`}
          </p>
          <div className="flex flex-col gap-[10px]">
            <RadioOption
              name="passkeyVerification"
              value={PASSKEY_VERIFICATION_OPTIONS.REQUESTED}
              label={t`Requested by website (default)`}
              description={t`Only ask for verification when the website requires it.`}
              isSelected={
                passkeyVerification === PASSKEY_VERIFICATION_OPTIONS.REQUESTED
              }
              onChange={handlePasskeyVerificationChange}
            />
            <RadioOption
              name="passkeyVerification"
              value={PASSKEY_VERIFICATION_OPTIONS.ALWAYS}
              label={t`Always`}
              description={t`Always require identity verification when using passkeys.`}
              isSelected={
                passkeyVerification === PASSKEY_VERIFICATION_OPTIONS.ALWAYS
              }
              onChange={handlePasskeyVerificationChange}
            />
            <RadioOption
              name="passkeyVerification"
              value={PASSKEY_VERIFICATION_OPTIONS.NEVER}
              label={t`Never`}
              description={t`Skip identity verification, even if the website requests it.`}
              isSelected={
                passkeyVerification === PASSKEY_VERIFICATION_OPTIONS.NEVER
              }
              onChange={handlePasskeyVerificationChange}
            />
          </div>
        </div>
      </CardSingleSetting>
    </div>
  )
}
