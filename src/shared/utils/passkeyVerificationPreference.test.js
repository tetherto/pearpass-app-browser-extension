import { shouldRequireVerification } from './passkeyVerificationPreference'
import {
  LOCAL_STORAGE_KEYS,
  PASSKEY_VERIFICATION_OPTIONS
} from '../constants/storage'

describe('passkeyVerificationPreference', () => {
  const PREFERENCE_KEY = LOCAL_STORAGE_KEYS.PASSKEY_VERIFICATION_PREFERENCE

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('shouldRequireVerification', () => {
    describe('when preference is ALWAYS', () => {
      beforeEach(() => {
        localStorage.setItem(
          PREFERENCE_KEY,
          PASSKEY_VERIFICATION_OPTIONS.ALWAYS
        )
      })

      it('returns true regardless of publicKey settings', () => {
        expect(shouldRequireVerification({})).toBe(true)
        expect(
          shouldRequireVerification({ userVerification: 'discouraged' })
        ).toBe(true)
        expect(shouldRequireVerification(undefined)).toBe(true)
      })
    })

    describe('when preference is NEVER', () => {
      beforeEach(() => {
        localStorage.setItem(PREFERENCE_KEY, PASSKEY_VERIFICATION_OPTIONS.NEVER)
      })

      it('returns false regardless of publicKey settings', () => {
        expect(
          shouldRequireVerification({ userVerification: 'required' })
        ).toBe(false)
        expect(
          shouldRequireVerification({
            authenticatorSelection: { userVerification: 'required' }
          })
        ).toBe(false)
      })
    })

    describe('when preference is REQUESTED (default)', () => {
      beforeEach(() => {
        localStorage.setItem(
          PREFERENCE_KEY,
          PASSKEY_VERIFICATION_OPTIONS.REQUESTED
        )
      })

      it('returns true if top-level userVerification is required', () => {
        const publicKey = { userVerification: 'required' }
        expect(shouldRequireVerification(publicKey)).toBe(true)
      })

      it('returns true if authenticatorSelection.userVerification is required', () => {
        const publicKey = {
          authenticatorSelection: { userVerification: 'required' }
        }
        expect(shouldRequireVerification(publicKey)).toBe(true)
      })

      it('returns false if userVerification is preferred', () => {
        const publicKey = { userVerification: 'preferred' }
        expect(shouldRequireVerification(publicKey)).toBe(false)
      })

      it('returns false if userVerification is discouraged', () => {
        const publicKey = { userVerification: 'discouraged' }
        expect(shouldRequireVerification(publicKey)).toBe(false)
      })

      it('returns false if authenticatorSelection.userVerification is preferred', () => {
        const publicKey = {
          authenticatorSelection: { userVerification: 'preferred' }
        }
        expect(shouldRequireVerification(publicKey)).toBe(false)
      })

      it('returns false if no userVerification field is present', () => {
        expect(shouldRequireVerification({})).toBe(false)
      })

      it('returns false if publicKey is undefined', () => {
        expect(shouldRequireVerification(undefined)).toBe(false)
      })
    })
  })
})
