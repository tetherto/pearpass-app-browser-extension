import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { useUserData, useVaults } from 'pearpass-lib-vault'

import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import { PAIRING_ERROR_PATTERNS } from '../shared/constants/nativeMessaging'
import { useToast } from '../shared/context/ToastContext'
import { secureChannelMessages } from '../shared/services/messageBridge'
import { logger } from '../shared/utils/logger'

export const PAIRING_STEP = {
  TOKEN: 'token',
  PASSWORD: 'password'
}

const PAIRING_ERROR_MESSAGES = {
  FAILED_TO_GET_IDENTITY:
    'Failed to get identity. Please ensure the desktop app is running.',
  PAIRING_FAILED: 'Pairing failed',
  INVALID_PASSWORD: 'Invalid master password. Please try again.'
}

export const usePairing = ({ onPairSuccess, handleBack, setStep }) => {
  const { setToast } = useToast()
  const { logIn } = useUserData()
  const { initVaults } = useVaults()
  const [pairingToken, setPairingToken] = useState('')
  const [identity, setIdentity] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const revalidateIdentity = async () => {
    try {
      const validatedIdentity = await secureChannelMessages.getIdentity(
        pairingToken.trim()
      )

      if (!validatedIdentity?.success || !validatedIdentity?.identity) {
        setToast({
          message: t(PAIRING_ERROR_MESSAGES.FAILED_TO_GET_IDENTITY)
        })
        handleBack()
        setIdentity(null)
        return null
      }

      // Check identity mismatch
      if (
        validatedIdentity.identity.ed25519PublicKey !==
          identity.ed25519PublicKey ||
        validatedIdentity.identity.x25519PublicKey !== identity.x25519PublicKey
      ) {
        setToast({
          message: t`Identity mismatch. Please verify desktop app.`
        })
        handleBack()
        setIdentity(null)
        return null
      }

      return validatedIdentity.identity
    } catch (validationError) {
      logger.error('Token validation failed:', validationError)
      setToast({
        message: t`Token validation failed. Please enter the new token from desktop.`
      })
      handleBack()
      setIdentity(null)
      return null
    }
  }

  const unlockKeystore = async (password) => {
    try {
      await secureChannelMessages.unlockClientKeystore(password)
      return true
    } catch (e) {
      if (e?.message?.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)) {
        setToast({ message: t`Incorrect password. Please try again.` })
        logger.error('Error unlocking keystore:', e)
        return false
      }
      logger.error('Keystore error, continuing:', e)
      // Continue even if other errors occur, consistent with previous logic
      return true
    }
  }

  const finalizePairing = async (validatedIdentity, password) => {
    // Confirm pairing with latest identity from desktop
    const { confirmed: pairingConfirmed } =
      await secureChannelMessages.confirmPair()
    const { success: identityPinned } =
      await secureChannelMessages.pinIdentity(validatedIdentity)

    if (!pairingConfirmed || !identityPinned) {
      handleBack()
      setIdentity(null)
      await secureChannelMessages.unpair()
      throw new Error(PAIRING_ERROR_MESSAGES.PAIRING_FAILED)
    }

    // Validate password and initialize vaults
    await logIn({ password })
    await initVaults({ password })

    setToast({ message: t`Paired successfully!` })
    onPairSuccess()
  }

  const completePairing = async (password) => {
    if (!identity) {
      setToast({ message: t`Please verify desktop identity first` })
      return
    }
    if (!password) {
      setToast({ message: t`Please enter your master password` })
      return
    }

    setLoading(true)
    try {
      const validatedIdentity = await revalidateIdentity()
      if (!validatedIdentity) return

      const unlocked = await unlockKeystore(password)
      if (!unlocked) return

      await finalizePairing(validatedIdentity, password)
    } catch (error) {
      logger.error('Failed to complete pairing:', error)
      const message =
        error.message === PAIRING_ERROR_MESSAGES.PAIRING_FAILED
          ? t(PAIRING_ERROR_MESSAGES.PAIRING_FAILED)
          : t(PAIRING_ERROR_MESSAGES.INVALID_PASSWORD)
      setToast({ message })
    } finally {
      setLoading(false)
    }
  }

  return {
    pairingToken,
    setPairingToken,
    identity,
    loading,
    fetchIdentity,
    completePairing
  }
}
