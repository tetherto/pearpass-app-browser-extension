import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUserData, useVaults } from 'pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ModalCard } from '../../../../shared/components/ModalCard'
import { AUTH_ERROR_PATTERNS } from '../../../../shared/constants/auth'
import { PAIRING_ERROR_PATTERNS } from '../../../../shared/constants/nativeMessaging'
import { useToast } from '../../../../shared/context/ToastContext'
import { secureChannelMessages } from '../../../../shared/services/messageBridge'
import { logger } from '../../../../shared/utils/logger'

/**
 * Pairing step enum
 */
const PAIRING_STEP = {
  TOKEN: 'token',
  PASSWORD: 'password'
}

/**
 * Error messages
 */
const PAIRING_ERROR_MESSAGES = {
  FAILED_TO_GET_IDENTITY:
    'Failed to get identity. Please ensure the desktop app is running.'
}

/**
 *
 * @param {Object} props
 * @param {Function} props.onPairSuccess
 */
export const PairingRequiredModalContent = ({ onPairSuccess }) => {
  const { setToast } = useToast()
  const { logIn } = useUserData()
  const { initVaults } = useVaults()
  const [pairingToken, setPairingToken] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [identity, setIdentity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(PAIRING_STEP.TOKEN)

  const fetchIdentity = async () => {
    if (!pairingToken || pairingToken.trim().length < 10) {
      setToast({
        message: t`Please enter a valid pairing token from the desktop app`
      })
      return
    }

    setLoading(true)
    try {
      const res = await secureChannelMessages.getIdentity(pairingToken.trim())
      if (res?.success && res?.identity) {
        setIdentity(res.identity)
        setStep(PAIRING_STEP.PASSWORD)
        setToast({
          message: t`Desktop verified! Enter your master password to complete.`
        })
      } else if (
        res?.error?.includes(PAIRING_ERROR_PATTERNS.INVALID_PAIRING_TOKEN)
      ) {
        throw new Error(t`Invalid pairing token. Please check and try again.`)
      } else {
        throw new Error(t(PAIRING_ERROR_MESSAGES.FAILED_TO_GET_IDENTITY))
      }
    } catch (error) {
      logger.error('Failed to fetch identity:', error)
      setToast({
        message:
          error.message ||
          (error.code === 'TIMEOUT'
            ? t`Request timed out. Please try again.`
            : t(PAIRING_ERROR_MESSAGES.FAILED_TO_GET_IDENTITY))
      })
    } finally {
      setLoading(false)
    }
  }

  const completePairing = async () => {
    if (!identity) {
      setToast({ message: t`Please verify desktop identity first` })
      return
    }
    if (!masterPassword) {
      setToast({ message: t`Please enter your master password` })
      return
    }

    setLoading(true)
    try {
      let validatedIdentity
      try {
        validatedIdentity = await secureChannelMessages.getIdentity(
          pairingToken.trim()
        )
      } catch (validationError) {
        logger.error('Token validation failed:', validationError)
        setToast({
          message: t`Token validation failed. Please enter the new token from desktop.`
        })
        setStep(PAIRING_STEP.TOKEN)
        setIdentity(null)
        setLoading(false)
        return
      }

      if (!validatedIdentity?.success || !validatedIdentity?.identity) {
        setToast({
          message: t(PAIRING_ERROR_MESSAGES.FAILED_TO_GET_IDENTITY)
        })
        setStep(PAIRING_STEP.TOKEN)
        setIdentity(null)
        setLoading(false)
        return
      }

      // Proceed with pairing using latest identity from desktop
      const pairingResponse = await secureChannelMessages.confirmPair(
        validatedIdentity.identity
      )
      if (!pairingResponse?.ok) {
        throw new Error(t`Pairing failed`)
      }

      try {
        await secureChannelMessages.unlockClientKeystore(masterPassword)
      } catch (e) {
        if (
          e?.message?.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
        ) {
          setLoading(false)
          setToast({ message: t`Incorrect password. Please try again.` })
          logger.error('Error unlocking keystore:', e)
          return
        }
        logger.error('Keystore error, continuing:', e)
      }

      // Validate password and initialize vaults
      await logIn({ password: masterPassword })
      await initVaults({ password: masterPassword })

      setToast({ message: t`Paired successfully!` })
      onPairSuccess()
    } catch (error) {
      logger.error('Failed to complete pairing:', error)
      setToast({ message: t`Invalid master password. Please try again.` })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(PAIRING_STEP.TOKEN)
    setMasterPassword('')
  }

  return (
    <ModalCard>
      <span className="font-inter text-white-mode1 text-2xl font-semibold">
        <Trans>Complete Pairing</Trans>
      </span>

      {step === PAIRING_STEP.TOKEN && (
        <>
          <div className="font-inter text-grey200-mode1 space-y-1 text-center text-sm">
            <p>
              <Trans>1. Open PearPass desktop app</Trans>
            </p>
            <p>
              <Trans>2. Go to Settings → Advanced → Custom settings</Trans>
            </p>
            <p>
              <Trans>3. Activate extension and copy the pairing token</Trans>
            </p>
          </div>

          <input
            type="text"
            value={pairingToken}
            onChange={(e) => setPairingToken(e.target.value)}
            placeholder={t`Enter pairing token`}
            className="bg-grey600-mode1 text-white-mode1 focus:ring-primary400-mode1 w-full rounded-lg p-3 font-mono text-sm focus:border-transparent focus:ring-2 focus:outline-none"
            disabled={loading}
            autoFocus
          />

          <div className="mt-2 flex w-full items-center justify-center">
            <ButtonPrimary
              disabled={loading || !pairingToken}
              onClick={fetchIdentity}
            >
              <Trans>{loading ? t`Verifying...` : t`Verify`}</Trans>
            </ButtonPrimary>
          </div>
        </>
      )}

      {step === PAIRING_STEP.PASSWORD && identity && (
        <>
          <div className="w-full rounded-lg bg-green-500/10 p-2">
            <div className="text-white-mode1 text-sm font-medium">
              <Trans>✓ Desktop Verified</Trans>
            </div>
            <div
              className="truncate font-mono text-xs text-green-400"
              title={identity.fingerprint}
            >
              {identity.fingerprint?.slice(0, 32)}...
            </div>
          </div>

          <span className="font-inter text-white-mode1 text-center text-base font-light">
            <Trans>Enter your master password to complete pairing</Trans>
          </span>

          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder={t`Master password`}
            className="bg-grey600-mode1 text-white-mode1 focus:ring-primary400-mode1 w-full rounded-lg p-3 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
            disabled={loading}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && masterPassword && !loading) {
                completePairing()
              }
            }}
          />

          <div className="mt-2 flex w-full items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="text-grey200-mode1 hover:text-white-mode1 text-sm underline"
            >
              <Trans>Back</Trans>
            </button>
            <ButtonPrimary
              disabled={loading || !masterPassword}
              onClick={completePairing}
            >
              <Trans>{loading ? t`Completing...` : t`Complete Pairing`}</Trans>
            </ButtonPrimary>
          </div>
        </>
      )}
    </ModalCard>
  )
}
