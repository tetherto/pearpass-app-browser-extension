import React from 'react'
import {
  Button,
  Title,
  Text,
  DialogSurface
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ONBOARDING_DIALOG_HEIGHT,
  ONBOARDING_ICON_COLOR,
  ONBOARDING_ICON_SIZE
} from './constants'
import { Extension, PushPin } from '@tetherto/pearpass-lib-ui-kit/icons'

interface Step1Props {
  onNext: () => void
}

export const Step1Dialog = ({ onNext }: Step1Props) => {
  const footer = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button variant="secondary" size="medium" onClick={onNext}>
        I will do it later
      </Button>
      <Button variant="primary" size="medium" onClick={onNext}>
        Done
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title="Step 1 of 3"
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
          src="/assets/images/step1.png"
          className="mx-auto my-6 block"
          alt="Step 1"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <Title as="h2">Pin Pearpass for quick access</Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              Pinning Pearpass keeps it one click away whenever you need it
            </Text>
            <Text as="p" variant="body">
              Keep Pearpass accessible in your toolbar for quick access to your
              items
            </Text>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                1. Click a
              </Text>
              <Extension
                color={ONBOARDING_ICON_COLOR}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body">
                in a toolbar
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                2. Click
              </Text>
              <PushPin
                color={ONBOARDING_ICON_COLOR}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body">
                next to a Pearpass
              </Text>
            </div>
          </div>
        </div>
      </div>
    </DialogSurface>
  )
}
