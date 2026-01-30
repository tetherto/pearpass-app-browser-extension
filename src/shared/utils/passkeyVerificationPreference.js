import {
  LOCAL_STORAGE_KEYS,
  PASSKEY_VERIFICATION_OPTIONS
} from '../constants/storage'

/**
 * @returns {string} One of PASSKEY_VERIFICATION_OPTIONS values
 */
export const getPasskeyVerificationPreference = () => {
  const saved = localStorage.getItem(
    LOCAL_STORAGE_KEYS.PASSKEY_VERIFICATION_PREFERENCE
  )
  return saved || PASSKEY_VERIFICATION_OPTIONS.REQUESTED
}

/**
 * Determines if verification (master password) is required for a passkey request
 * based on user preference and the website's requirement.
 *
 * @param {Object} publicKey - The WebAuthn request object
 * @returns {boolean} True if verification is required
 */
export const shouldRequireVerification = (publicKey) => {
  const userPreference = getPasskeyVerificationPreference()

  if (userPreference === PASSKEY_VERIFICATION_OPTIONS.ALWAYS) return true

  if (userPreference === PASSKEY_VERIFICATION_OPTIONS.NEVER) return false

  // Check both authentication (top-level) and creation (authenticatorSelection)
  return (
    publicKey?.userVerification === 'required' ||
    publicKey?.authenticatorSelection?.userVerification === 'required'
  )
}
