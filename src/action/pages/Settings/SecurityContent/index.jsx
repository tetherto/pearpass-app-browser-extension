import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import {
  AUTO_LOCK_TIMEOUT_OPTIONS,
  BE_AUTO_LOCK_ENABLED
} from 'pearpass-lib-constants'

import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { CardSingleSetting } from '../../../../shared/components/CardSingleSetting'
import {
  Menu,
  MenuContent,
  MenuTrigger
} from '../../../../shared/components/Menu'
import { RadioOption } from '../../../../shared/components/RadioOption'
import { Select } from '../../../../shared/components/Select'
import { SwitchWithLabel } from '../../../../shared/components/SwitchWithLabel'
import {
  LOCAL_STORAGE_KEYS,
  PASSKEY_VERIFICATION_OPTIONS
} from '../../../../shared/constants/storage'
import { useAllowHttpEnabled } from '../../../../shared/hooks/useAllowHttpEnabled'
import { useCopyToClipboard } from '../../../../shared/hooks/useCopyToClipboard'
import { InfoIcon } from '../../../../shared/icons/InfoIcon'
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

  const { isAutoLockEnabled, timeoutMs, setTimeoutMs } =
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
    timeoutMs === null
      ? translatedOptions.find((option) => option.value === null)
      : translatedOptions.find((option) => option.value === timeoutMs) ||
        translatedOptions[0]

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
              <div className="flex justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="font-inter text-[14px] font-bold text-white">{t`Auto Log-out`}</div>
                  <div className="mb-[6px] text-[12px] text-white/70">{t`Automatically logs you out after you stop interacting with the app, based on the timeout you select.`}</div>
                </div>
                <Menu openOnHover>
                  <MenuTrigger stopPropagation>
                    <InfoIcon />
                  </MenuTrigger>
                  <MenuContent>
                    <div className="bg-grey400-mode1 flex w-max flex-col rounded-[10px] p-2.5 shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
                      <div className="text-white-mode1 flex w-[400px] flex-col gap-2.5 leading-4">
                        <ul className="flex list-disc flex-col gap-2 pt-1 pl-5">
                          <li>
                            <Trans>
                              Auto-lock determines how long Pearpass stays
                              unlocked when you're not actively using it.
                            </Trans>
                          </li>
                          <li>
                            <Trans>
                              Inactivity is based on your interaction with
                              Pearpass, not on device idle time.
                            </Trans>
                          </li>

                          {BE_AUTO_LOCK_ENABLED && (
                            <li>
                              <Trans>
                                The browser activity will also keep your session
                                aligned in Desktop while you're working, and the
                                setting will be shared by both. Mobile auto-lock
                                is managed separately.
                              </Trans>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </MenuContent>
                </Menu>
              </div>
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
