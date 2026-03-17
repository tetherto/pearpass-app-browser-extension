// PairingRequiredModalContentV2.tsx

import React, { useState, useEffect, useCallback } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  Title,
  Text,
  Button,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'

import { useDesktopPairing } from '../../../../hooks/useDesktopPairing'

// Opens onboarding.html in a tab.
// If already open in another tab, focuses it instead of opening a new one.
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

/**
 *
 * A simplified, full-screen pairing experience for PearPass.
 * Automatically detects the pending pairing token and prompts for the master password.
 *
 * @param {Object} props
 * @param {Function} props.onPairSuccess - Callback on successful pairing
 */
export const PairingRequiredModalContentV2 = ({
  onPairSuccess
}: {
  onPairSuccess: () => void
}) => {
  const [masterPassword, setMasterPassword] = useState('')
  const [missingToken, setMissingToken] = useState(false)

  const {
    pairingToken,
    setPairingToken,
    identity,
    loading,
    error,
    fetchIdentity,
    completePairing
  } = useDesktopPairing({
    onPairSuccess,
    handleBack: () => {}, // No back navigation in V2
    setStep: () => {} // No step in V2
  })

  // Fetches the pairing token from localStorage, which is set
  // when the user completes the token input on onboarding.html
  useEffect(() => {
    const token = localStorage.getItem('PendingPairingToken')

    if (!token) {
      setMissingToken(true)
      const timer = setTimeout(async () => {
        await openOnboardingPage()
        window.close()
      }, 2000)
      return () => clearTimeout(timer)
    }

    if (token && token !== pairingToken) {
      setPairingToken(token)
    }
  }, [pairingToken, setPairingToken])

  // Automatically fetch identity behind the scenes once the token is known
  useEffect(() => {
    if (pairingToken && !identity && !loading && !error) {
      void fetchIdentity()
    }
  }, [pairingToken, identity, loading, fetchIdentity])

  // If an error occurs, remove the invalid token and navigate back to onboarding
  useEffect(() => {
    if (error) {
      localStorage.removeItem('PendingPairingToken')
      const timer = setTimeout(async () => {
        await openOnboardingPage()
        window.close()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleComplete = useCallback(async () => {
    if (masterPassword && !loading && identity) {
      void completePairing(masterPassword)
    }
  }, [masterPassword, loading, identity, completePairing])

  if (missingToken) {
    return (
      <div
        id="pairing-modal-v2"
        className="bg-grey500-mode1 flex h-full w-full flex-col overflow-hidden"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8">
          <header className="flex flex-col items-center gap-3 text-center">
            <Title as="h1">
              <Trans>Insert Pairing Token</Trans>
            </Title>
            <Text variant="body">
              <Trans>Navigating to onboarding page...</Trans>
            </Text>
          </header>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        id="pairing-modal-v2"
        className="bg-grey500-mode1 flex h-full w-full flex-col overflow-hidden"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8">
          <header className="flex flex-col items-center gap-3 text-center">
            <Title as="h1">
              <Trans>Invalid Pairing Token</Trans>
            </Title>
            <Text variant="body">
              <Trans>Navigating to onboarding page...</Trans>
            </Text>
          </header>
        </div>
      </div>
    )
  }

  return (
    <div
      id="pairing-modal-v2"
      className="bg-grey500-mode1 flex h-full w-full flex-col overflow-hidden"
      style={{ minHeight: '100vh', minWidth: '100vw' }}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8">
        <div className="flex flex-col gap-10">
          <header className="flex flex-col items-center gap-3 text-center">
            <Title as="h1">
              <Trans>Enter Your Master Password</Trans>
            </Title>
            <Text variant="body">
              <Trans>Enter your Master Password to complete the pairing</Trans>
            </Text>
          </header>

          <main className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <PasswordField
                label={t`Master Password`}
                placeholderText={t`Enter password`}
                value={masterPassword}
                onChangeText={setMasterPassword}
                testID="pairing-password-input"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleComplete}
                isLoading={loading}
                disabled={!masterPassword || loading || !identity}
              >
                <Trans>Continue</Trans>
              </Button>
            </div>
          </main>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[5000] flex cursor-wait items-center justify-center bg-[#0F111A]/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="border-primary400-mode1 absolute h-full w-full animate-spin rounded-full border-4 border-t-transparent shadow-[0_0_15px_rgba(var(--primary400),0.3)]"></div>
              <div className="bg-primary400-mode1/20 h-10 w-10 animate-pulse rounded-full"></div>
            </div>
            <span className="text-white-mode1 font-inter text-lg font-medium tracking-wide">
              <Trans>Verifying Connection...</Trans>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
