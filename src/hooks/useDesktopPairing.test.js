import { renderHook, act } from '@testing-library/react'
import { useUserData, useVaults } from 'pearpass-lib-vault'

import { useDesktopPairing, PAIRING_STEP } from './useDesktopPairing.js'
import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import { useToast } from '../shared/context/ToastContext'
import { secureChannelMessages } from '../shared/services/messageBridge'

jest.mock('pearpass-lib-vault')
jest.mock('../shared/context/ToastContext')
jest.mock('../shared/services/messageBridge')
jest.mock('../shared/utils/logger')
jest.mock('@lingui/core/macro', () => ({
  t: (str) => {
    // Handling tagged template literals
    if (Array.isArray(str) && str.raw) {
      return str.join('')
    }
    // Handling direct function calls
    return str
  }
}))

describe('usePairing', () => {
  const mockSetToast = jest.fn()
  const mockLogIn = jest.fn()
  const mockInitVaults = jest.fn()
  const mockOnPairSuccess = jest.fn()
  const mockHandleBack = jest.fn()
  const mockSetStep = jest.fn()

  const props = {
    onPairSuccess: mockOnPairSuccess,
    handleBack: mockHandleBack,
    setStep: mockSetStep
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useToast.mockReturnValue({ setToast: mockSetToast })
    useUserData.mockReturnValue({ logIn: mockLogIn })
    useVaults.mockReturnValue({ initVaults: mockInitVaults })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDesktopPairing(props))

    expect(result.current.pairingToken).toBe('')
    expect(result.current.identity).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  describe('fetchIdentity', () => {
    it('should validate token length', async () => {
      const { result } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('short')
        await result.current.fetchIdentity()
      })

      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Please enter a valid pairing token')
        })
      )
      expect(secureChannelMessages.getIdentity).not.toHaveBeenCalled()
    })

    it('should handle successful identity fetch', async () => {
      const mockIdentity = { ed25519PublicKey: 'pubKey', fingerprint: 'fp' }
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: true,
        identity: mockIdentity
      })

      const { result } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('valid-token-12345')
      })

      // Need to await this act separately to ensure state update propagates
      await act(async () => {
        await result.current.fetchIdentity()
      })

      expect(result.current.identity).toEqual(mockIdentity)
      expect(mockSetStep).toHaveBeenCalledWith(PAIRING_STEP.PASSWORD)
      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Desktop verified')
        })
      )
    })

    it('should handle identity fetch error', async () => {
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: false,
        error: 'Some error'
      })

      const { result } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('valid-token-12345')
      })

      await act(async () => {
        await result.current.fetchIdentity()
      })

      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Failed to get identity')
        })
      )
    })
  })

  describe('completePairing', () => {
    it('should require identity and master password', async () => {
      const { result } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        await result.current.completePairing()
      })

      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Please verify desktop identity')
        })
      )
    })

    it('should handle successful pairing flow', async () => {
      const mockIdentity = {
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xKey'
      }
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: true,
        identity: mockIdentity
      })
      secureChannelMessages.confirmPair.mockResolvedValue({ confirmed: true })
      secureChannelMessages.unlockClientKeystore.mockResolvedValue({
        success: true
      })
      secureChannelMessages.pinIdentity.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDesktopPairing(props))

      // Setup state
      await act(async () => {
        result.current.setPairingToken('token-long-enough')
      })

      await act(async () => {
        await result.current.fetchIdentity()
      })

      await act(async () => {
        await result.current.completePairing('password')
      })

      expect(secureChannelMessages.getIdentity).toHaveBeenCalledTimes(2) // Initial + validation
      expect(secureChannelMessages.unlockClientKeystore).toHaveBeenCalledWith(
        'password'
      )
      expect(secureChannelMessages.confirmPair).toHaveBeenCalled()
      expect(secureChannelMessages.pinIdentity).toHaveBeenCalledWith(
        mockIdentity
      )
      expect(mockLogIn).toHaveBeenCalledWith({ password: 'password' })
      expect(mockInitVaults).toHaveBeenCalledWith({ password: 'password' })
      expect(mockOnPairSuccess).toHaveBeenCalled()
    })

    it('should clear pairing data on pairing failure', async () => {
      const mockIdentity = {
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xKey'
      }
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: true,
        identity: mockIdentity
      })
      secureChannelMessages.confirmPair.mockResolvedValue({ confirmed: false })
      secureChannelMessages.pinIdentity.mockResolvedValue({ success: true })

      // Mock validation success to proceed to confirmPair
      secureChannelMessages.getIdentity
        .mockResolvedValueOnce({
          success: true,
          identity: mockIdentity
        })
        .mockResolvedValueOnce({
          success: true,
          identity: mockIdentity
        })

      const { result } = renderHook(() => useDesktopPairing(props))

      // Setup state
      await act(async () => {
        result.current.setPairingToken('token-long-enough')
      })

      await act(async () => {
        await result.current.fetchIdentity()
      })

      await act(async () => {
        await result.current.completePairing('password')
      })

      expect(secureChannelMessages.confirmPair).toHaveBeenCalled()
      expect(mockHandleBack).toHaveBeenCalled()
      expect(secureChannelMessages.unpair).toHaveBeenCalled()
      expect(result.current.identity).toBeNull()
      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Pairing failed')
        })
      )
    })

    it('should handle password error during unlock', async () => {
      const mockIdentity = {
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xKey'
      }
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: true,
        identity: mockIdentity
      })
      secureChannelMessages.unlockClientKeystore.mockRejectedValue(
        new Error(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
      )

      const { result } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('token-long-enough')
      })

      await act(async () => {
        await result.current.fetchIdentity()
      })

      await act(async () => {
        await result.current.completePairing('wrong-password')
      })

      expect(mockSetToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Incorrect password')
        })
      )
      expect(secureChannelMessages.confirmPair).not.toHaveBeenCalled()
    })
  })
})
