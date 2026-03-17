import React from 'react'
import {
  Button,
  Title,
  Text,
  DialogSurface
} from '@tetherto/pearpass-lib-ui-kit'
import { DoneAll } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  ONBOARDING_DIALOG_HEIGHT,
  ONBOARDING_ICON_COLOR,
  ONBOARDING_ICON_SIZE
} from './constants'

export const Step3Dialog = () => {
  const handleNext = () => {
    // todo: does it work aslo in other browsers like firefox? safari?
    if (
      typeof chrome !== 'undefined' &&
      chrome.action &&
      chrome.action.openPopup
    ) {
      chrome.action.openPopup()
    }
  }

  const footer = (
    <div className="flex w-full items-center justify-end">
      <Button variant="primary" size="medium" onClick={handleNext}>
        Open Pearpass extension
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title="Step 3 of 3"
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
          src="/assets/images/step3.png"
          className="mx-auto my-6 block"
          alt="Step 3"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <Title as="h2">Your browser is now securely connected</Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              You can autofill, save and generate passwords instantly.
            </Text>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
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
                Browser connected
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
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
                Sync activated
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
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
                Autofill enabled
              </Text>
            </div>
          </div>
        </div>
      </div>
    </DialogSurface>
  )
}
