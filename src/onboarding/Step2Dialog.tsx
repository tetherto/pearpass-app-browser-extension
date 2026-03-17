import React, { useState } from 'react'
import {
  Button,
  Title,
  Text,
  InputField,
  AlertMessage,
  DialogSurface
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ONBOARDING_DIALOG_HEIGHT,
  ONBOARDING_ICON_COLOR,
  ONBOARDING_ICON_SIZE
} from './constants'
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
        setError('Failed to get identity. Please try again.')
      }
    } catch (err: unknown) {
      console.error('Failed to get identity:', err)
      let errorMessage = 'An unknown error occurred'
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
        Connect Browser
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title="Step 2 of 3"
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
          <Title as="h2">Connect this browser to Pearpass</Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              Pearpass doesn't use accounts. To connect this browser you will
              pair it with the Pearpass app using a one-time code.
            </Text>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                1. Open the
              </Text>
              <PearpassLogo
                color={ONBOARDING_ICON_COLOR}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text
                as="span"
                variant="body"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={{ color: ONBOARDING_ICON_COLOR } as any}
              >
                Pearpass
              </Text>
              <Text as="span" variant="body">
                app.
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                2. Go to
              </Text>
              <Settings
                color={ONBOARDING_ICON_COLOR}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text
                as="span"
                variant="body"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={{ color: ONBOARDING_ICON_COLOR } as any}
              >
                Settings → Syncing → Your Devices.
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                3. Click on
              </Text>
              <Swap
                color={ONBOARDING_ICON_COLOR}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text
                as="span"
                variant="body"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={{ color: ONBOARDING_ICON_COLOR } as any}
              >
                Generate Pair Code for Browser Extension
              </Text>
              <Text as="span" variant="body">
                {' '}
                &amp; Enter Code Below
              </Text>
            </div>
          </div>
          <div className="w-full text-left">
            <InputField
              label="One-time code"
              value={code}
              placeholderText="Enter your one-time code"
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
                  title="Error"
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
