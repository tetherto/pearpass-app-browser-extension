import React, { useCallback, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  Title,
  Text,
  Button,
  PasswordField,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { KeyboardArrowRightRound } from '@tetherto/pearpass-lib-ui-kit/icons'

interface MasterPasswordPromptProps {
  onSubmit: (password: string) => Promise<void> | void
  error?: string
  onPasswordChange?: () => void
  testID?: string
  children?: React.ReactNode
}

export const MasterPasswordPrompt = ({
  onSubmit,
  error,
  onPasswordChange,
  testID,
  children
}: MasterPasswordPromptProps) => {
  const { theme } = useTheme()
  const secondaryTextColor = theme.colors.colorTextSecondary

  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (value: string) => {
    setPassword(value)
    onPasswordChange?.()
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!password || isSubmitting) return
      setIsSubmitting(true)
      try {
        await onSubmit(password)
      } finally {
        setIsSubmitting(false)
      }
    },
    [password, isSubmitting, onSubmit]
  )

  return (
    <div className="bg-surface-primary flex h-full w-full items-center justify-center overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[500px] flex-col gap-[var(--spacing24)] p-[12px]"
      >
        <header className="flex flex-col items-center gap-[var(--spacing6)] text-center">
          <Title as="h1">
            <Trans>Enter Your Master Password</Trans>
          </Title>
          <Text variant="label" color={secondaryTextColor}>
            <Trans>
              Please enter your master password to open the browser extension
            </Trans>
          </Text>
        </header>

        <PasswordField
          label={t`Password`}
          placeholder={t`Enter Master Password`}
          value={password}
          onChangeText={handleChange}
          error={error || undefined}
          testID={testID}
        />

        {children}

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="small"
            type="submit"
            isLoading={isSubmitting}
            disabled={!password || isSubmitting}
            iconAfter={<KeyboardArrowRightRound width={16} height={16} />}
          >
            <Trans>Continue</Trans>
          </Button>
        </div>
      </form>
    </div>
  )
}
