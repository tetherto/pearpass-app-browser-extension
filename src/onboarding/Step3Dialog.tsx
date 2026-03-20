import React from 'react'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  Title,
  Text,
  DialogSurface,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { DoneAll } from '@tetherto/pearpass-lib-ui-kit/icons'
import { ONBOARDING_DIALOG_HEIGHT, ONBOARDING_ICON_SIZE } from './constants'

export const Step3Dialog = () => {
  const { theme } = useTheme()
  const iconColor = theme.colors.colorPrimary

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
        <Trans>Open Pearpass extension</Trans>
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title={<Trans>Step 3 of 3</Trans>}
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
          <Title as="h2">
            <Trans>Your browser is now securely connected</Trans>
          </Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              <Trans>
                You can autofill, save and generate passwords instantly.
              </Trans>
            </Text>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Browser connected</Trans>
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Sync activated</Trans>
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <DoneAll
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body" color={iconColor}>
                <Trans>Autofill enabled</Trans>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </DialogSurface>
  )
}
