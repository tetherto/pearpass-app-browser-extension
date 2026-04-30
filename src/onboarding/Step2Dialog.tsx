import React, { useState } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  Title,
  Text,
  InputField,
  Panel,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ONBOARDING_ICON_SIZE } from './constants'
import { SyncingFailedModal } from './SyncingFailedModal'
import { secureChannelMessages } from '../shared/services/messageBridge'
import { pendingPairingStore } from '../shared/services/pendingPairingStore'
import {
  PearpassLogo,
  Settings,
  SwapVert
} from '@tetherto/pearpass-lib-ui-kit/icons'

interface Step2Props {
  onNext: () => void
}

export const Step2Dialog = ({ onNext }: Step2Props) => {
  const { theme } = useTheme()
  const accentColor = theme.colors.colorLinkText

  const [code, setCode] = useState('')
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null)

  const extractErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message
      if (typeof msg === 'string' && msg.length > 0) return msg
    }
    return t`Failed to get identity. Please try again.`
  }

  const handleConnect = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    try {
      const res = await secureChannelMessages.getIdentity(trimmed)
      if (res?.success) {
        await pendingPairingStore.set(trimmed)
        setSyncErrorMessage(null)
        onNext()
      } else {
        await pendingPairingStore.clear()
        const upstreamError =
          res && typeof res === 'object' && 'error' in res
            ? (res as { error?: unknown }).error
            : undefined
        setSyncErrorMessage(
          typeof upstreamError === 'string' && upstreamError.length > 0
            ? upstreamError
            : t`Failed to get identity. Please try again.`
        )
      }
    } catch (err: unknown) {
      console.error('Failed to get identity:', err)
      await pendingPairingStore.clear()
      setSyncErrorMessage(extractErrorMessage(err))
    }
  }

  if (syncErrorMessage !== null) {
    return (
      <SyncingFailedModal
        onRetry={handleConnect}
        onCancel={() => setSyncErrorMessage(null)}
        errorMessage={syncErrorMessage}
      />
    )
  }

  return (
    <Panel
      title={<Trans>Step 2 of 3</Trans>}
      footer={
        <div className="flex w-full items-center justify-end">
          <Button
            variant="primary"
            size="medium"
            onClick={handleConnect}
            disabled={!code.trim()}
            data-testid="onboarding-step2-connect-button"
          >
            <Trans>Connect Browser</Trans>
          </Button>
        </div>
      }
      hideCloseButton
      testID="onboarding-step2-dialog"
    >
      <div className="flex flex-col gap-[var(--spacing24)] px-[var(--spacing8)] py-[var(--spacing24)]">
        <div className="bg-surface-hover border-border-primary relative h-[200px] w-full overflow-hidden rounded-lg border">
          <img
            src="/assets/images/step2.svg"
            className="h-full w-full object-cover"
            alt="Step 2"
          />
        </div>

        <div className="flex flex-col gap-[var(--spacing16)]">
          <div className="flex flex-col items-center gap-[var(--spacing16)] text-center">
            <Title as="h2">
              <Trans>Connect This Browser to PearPass</Trans>
            </Title>
            <div className="flex flex-col gap-[var(--spacing12)]">
              <Text as="p">
                <Trans>
                  PearPass doesn't use accounts. To connect this browser, you'll
                  pair it with the PearPass app using a one-time code.
                </Trans>
              </Text>
              <div className="flex flex-col gap-[var(--spacing8)]">
                <div className="flex items-center justify-center gap-[var(--spacing4)]">
                  <Text as="span" noWrap>
                    <Trans>1. Open the</Trans>
                  </Text>
                  <PearpassLogo
                    color={accentColor}
                    width={ONBOARDING_ICON_SIZE}
                    height={ONBOARDING_ICON_SIZE}
                    style={{ flexShrink: 0 }}
                  />
                  <Text as="span" noWrap>
                    <span style={{ color: accentColor }}>
                      <Trans>PearPass</Trans>
                    </span>{' '}
                    <Trans>app</Trans>
                  </Text>
                </div>
                <div className="flex items-center justify-center gap-[var(--spacing4)]">
                  <Text as="span" noWrap>
                    <Trans>2. Go to</Trans>
                  </Text>
                  <Settings
                    color={accentColor}
                    width={ONBOARDING_ICON_SIZE}
                    height={ONBOARDING_ICON_SIZE}
                    style={{ flexShrink: 0 }}
                  />
                  <Text as="span" color={accentColor} noWrap>
                    <Trans>Settings → Syncing → Your Devices</Trans>
                  </Text>
                </div>
                <div className="flex items-center justify-center gap-[var(--spacing4)]">
                  <Text as="span" noWrap>
                    <Trans>3. Click on</Trans>
                  </Text>
                  <SwapVert
                    color={accentColor}
                    width={ONBOARDING_ICON_SIZE}
                    height={ONBOARDING_ICON_SIZE}
                    style={{ flexShrink: 0 }}
                  />
                  <Text as="span" noWrap>
                    <span style={{ color: accentColor }}>
                      <Trans>Generate Pair Code for Browser Extension</Trans>
                    </span>
                    {' & Enter Code Below'}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <InputField
            label={t`Browser Extension Pair Code`}
            value={code}
            placeholder={t`Enter Your Pair Code`}
            onChange={(e) => {
              setCode(e.target.value)
            }}
            testID="onboarding-step2-code-input"
          />
        </div>
      </div>
    </Panel>
  )
}
