import React, { useState } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  Title,
  Text,
  InputField,
  AlertMessage,
  DialogSurface,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ONBOARDING_DIALOG_HEIGHT, ONBOARDING_ICON_SIZE } from './constants'
import { secureChannelMessages } from '../shared/services/messageBridge'
import {
  PearpassLogo,
  Settings,
  Swap
} from '@tetherto/pearpass-lib-ui-kit/icons'

interface Step2Props {
  onNext: () => void
}

export const Step2Dialog = ({ onNext }: Step2Props) => {
  const { theme } = useTheme()
  const iconColor = theme.colors.colorPrimary

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      console.log('Sending token:', code)
      const res = await secureChannelMessages.getIdentity(code.trim())
      console.log('Identity response:', res)
      if (res?.success) {
        // todo: could this have some security implications?
        localStorage.setItem('PendingPairingToken', code.trim())
        onNext()
      } else {
        setError(t`Failed to get identity. Please try again.`)
      }
    } catch (err: unknown) {
      console.error('Failed to get identity:', err)
      let errorMessage = t`An unknown error occurred`
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as Error).message
      }
      setError(errorMessage)
    }
  }

  const footer = (
    <div className="flex w-full items-center justify-end">
      <Button
        variant="primary"
        size="medium"
        onClick={handleConnect}
        disabled={!code.trim()}
      >
        <Trans>Connect Browser</Trans>
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title={<Trans>Step 2 of 3</Trans>}
      footer={footer}
      hideCloseButton
      style={
        {
          width: '100%',
          maxWidth: '100%',
          minHeight: ONBOARDING_DIALOG_HEIGHT
        } as any
      }
    >
      <div className="flex flex-col gap-4">
        <img
          src="/assets/images/step2.png"
          className="mx-auto my-6 block"
          alt="Step 2"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <Title as="h2">
            <Trans>Connect this browser to Pearpass</Trans>
          </Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              <Trans>
                Pearpass doesn't use accounts. To connect this browser you will
                pair it with the Pearpass app using a one-time code.
              </Trans>
            </Text>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                <Trans>1. Open the</Trans>
              </Text>
              <PearpassLogo
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Pearpass</Trans>
              </Text>
              <Text as="span" variant="body">
                <Trans>app.</Trans>
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                <Trans>2. Go to</Trans>
              </Text>
              <Settings
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Settings → Syncing → Your Devices.</Trans>
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                <Trans>3. Click on</Trans>
              </Text>
              <Swap
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Generate Pair Code for Browser Extension</Trans>
              </Text>
              <Text as="span" variant="body">
                {' '}
                <Trans>&amp; Enter Code Below</Trans>
              </Text>
            </div>
          </div>
          <div className="w-full text-left">
            <InputField
              label={t`One-time code`}
              value={code}
              placeholderText={t`Enter your one-time code`}
              onChangeText={(val) => {
                setCode(val)
                setError(null)
              }}
            />
            {error && (
              <div className="mt-4">
                <AlertMessage
                  variant="error"
                  size="small"
                  title={t`Error`}
                  description={error}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogSurface>
  )
}
