import React from 'react'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  Title,
  Text,
  DialogSurface,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ONBOARDING_DIALOG_HEIGHT, ONBOARDING_ICON_SIZE } from './constants'
import { Extension, PushPin } from '@tetherto/pearpass-lib-ui-kit/icons'

interface Step1Props {
  onNext: () => void
}

export const Step1Dialog = ({ onNext }: Step1Props) => {
  const { theme } = useTheme()
  const iconColor = theme.colors.colorPrimary

  const footer = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button variant="secondary" size="medium" onClick={onNext}>
        <Trans>I will do it later</Trans>
      </Button>
      <Button variant="primary" size="medium" onClick={onNext}>
        <Trans>Done</Trans>
      </Button>
    </div>
  )

  return (
    <DialogSurface
      title={<Trans>Step 1 of 3</Trans>}
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
          <Title as="h2">
            <Trans>Pin Pearpass for quick access</Trans>
          </Title>
          <div className="flex flex-col gap-2">
            <Text as="p" variant="body">
              <Trans>
                Pinning Pearpass keeps it one click away whenever you need it
              </Trans>
            </Text>
            <Text as="p" variant="body">
              <Trans>
                Keep Pearpass accessible in your toolbar for quick access to
                your items
              </Trans>
            </Text>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                <Trans>1. Click a</Trans>
              </Text>
              <Extension
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body">
                <Trans>in a toolbar</Trans>
              </Text>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Text as="span" variant="body">
                <Trans>2. Click</Trans>
              </Text>
              <PushPin
                color={iconColor}
                width={ONBOARDING_ICON_SIZE}
                height={ONBOARDING_ICON_SIZE}
              />
              <Text as="span" variant="body">
                <Trans>next to a Pearpass</Trans>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </DialogSurface>
  )
}
