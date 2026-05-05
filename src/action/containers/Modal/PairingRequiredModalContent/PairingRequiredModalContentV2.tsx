// PairingRequiredModalContentV2.tsx

import React, { useState, useEffect } from 'react'

import { Trans } from '@lingui/react/macro'
import { Title, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useDesktopPairing } from '../../../../hooks/useDesktopPairing'
import { MasterPasswordPrompt } from '../../MasterPasswordPrompt/MasterPasswordPrompt'

export async function openOnboardingPage() {
  const onboardingUrl = chrome.runtime.getURL('onboarding.html')

  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  const isCurrentTabOnboarding = currentTab?.url?.includes('onboarding.html')

  if (isCurrentTabOnboarding) return

  const allExtensionTabs = await chrome.tabs.query({
    url: chrome.runtime.getURL('*')
  })

  const existingOnboardingTab = allExtensionTabs.find((t) =>
    t.url?.includes('onboarding.html')
  )

  if (existingOnboardingTab) {
    await chrome.tabs.update(existingOnboardingTab.id, { active: true })
    if (existingOnboardingTab.windowId) {
      await chrome.windows.update(existingOnboardingTab.windowId, {
        focused: true
      })
    }
    return
  }

  await chrome.tabs.create({ url: onboardingUrl })
}

export const PairingRequiredModalContentV2 = ({
  onPairSuccess
}: {
  onPairSuccess: () => void
}) => {
  const [missingToken, setMissingToken] = useState(false)
  const { theme } = useTheme()
  const secondaryTextColor = theme.colors.colorTextSecondary

  const {
    pairingToken,
    identity,
    loading,
    error,
    passwordError,
    clearPasswordError,
    hydrated,
    fetchIdentity,
    completePairing
  } = useDesktopPairing({
    onPairSuccess,
    handleBack: () => {},
    setStep: () => {},
    showVerifiedToast: false,
    hydrateFromStore: true
  })

  useEffect(() => {
    if (!hydrated || pairingToken) return
    setMissingToken(true)
    const timer = setTimeout(async () => {
      await openOnboardingPage()
      window.close()
    }, 2000)
    return () => clearTimeout(timer)
  }, [hydrated, pairingToken])

  useEffect(() => {
    if (pairingToken && !identity && !loading && !error) {
      void fetchIdentity()
    }
  }, [pairingToken, identity, loading, fetchIdentity])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(async () => {
      await openOnboardingPage()
      window.close()
    }, 2000)
    return () => clearTimeout(timer)
  }, [error])

  useEffect(() => {
    if (!passwordError) return
    const timer = setTimeout(async () => {
      await openOnboardingPage()
      window.close()
    }, 2000)
    return () => clearTimeout(timer)
  }, [passwordError])

  if (missingToken) {
    return (
      <div
        id="pairing-modal-v2"
        className="bg-surface-primary flex h-full w-full items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        <header className="flex w-full max-w-[500px] flex-col items-center gap-[var(--spacing6)] text-center">
          <Title as="h1">
            <Trans>Insert Pairing Token</Trans>
          </Title>
          <Text variant="label" color={secondaryTextColor}>
            <Trans>Navigating to onboarding page...</Trans>
          </Text>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div
        id="pairing-modal-v2"
        className="bg-surface-primary flex h-full w-full items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        <header className="flex w-full max-w-[500px] flex-col items-center gap-[var(--spacing6)] text-center">
          <Title as="h1">
            <Trans>Invalid Pairing Token</Trans>
          </Title>
          <Text variant="label" color={secondaryTextColor}>
            <Trans>Navigating to onboarding page...</Trans>
          </Text>
        </header>
      </div>
    )
  }

  return (
    <MasterPasswordPrompt
      onSubmit={(password) => completePairing(password)}
      error={passwordError ?? undefined}
      onPasswordChange={clearPasswordError}
      testID="pairing-password-input"
    />
  )
}
