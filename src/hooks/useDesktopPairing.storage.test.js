// Tests the storage behavior added to useDesktopPairing:
// hydration from pendingPairingStore on mount, clear on fetchIdentity
// failure, and clear on successful pair.
//
// Uses only react + react-dom/client — no @testing-library dependency.

import { act, createElement } from 'react'

import { useUserData, useVaults } from '@tetherto/pearpass-lib-vault'
import { createRoot } from 'react-dom/client'

import { useDesktopPairing } from './useDesktopPairing.js'
import { useToast } from '../shared/context/ToastContext'
import { secureChannelMessages } from '../shared/services/messageBridge'
import { pendingPairingStore } from '../shared/services/pendingPairingStore'

jest.mock('@tetherto/pearpass-lib-vault')
jest.mock('../shared/context/ToastContext')
jest.mock('../shared/services/messageBridge')
jest.mock('../shared/services/pendingPairingStore', () => ({
  pendingPairingStore: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn()
  }
}))
jest.mock('../shared/utils/logger')
jest.mock('@lingui/core/macro', () => ({
  t: (str) => (Array.isArray(str) && str.raw ? str.join('') : str)
}))

// Required for React 19 act() to flush effects in jsdom.
global.IS_REACT_ACT_ENVIRONMENT = true

function renderHook(fn) {
  let latest = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  function Wrapper() {
    latest = fn()
    return null
  }

  act(() => {
    root.render(createElement(Wrapper))
  })

  return {
    get result() {
      return {
        get current() {
          return latest
        }
      }
    },
    cleanup() {
      act(() => root.unmount())
      document.body.removeChild(container)
    }
  }
}

describe('useDesktopPairing — storage behavior', () => {
  const mockSetToast = jest.fn()
  const mockLogIn = jest.fn()
  const mockInitVaults = jest.fn()
  const mockOnPairSuccess = jest.fn()

  const props = {
    onPairSuccess: mockOnPairSuccess,
    handleBack: jest.fn(),
    setStep: jest.fn(),
    hydrateFromStore: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useToast.mockReturnValue({ setToast: mockSetToast })
    useUserData.mockReturnValue({ logIn: mockLogIn })
    useVaults.mockReturnValue({ initVaults: mockInitVaults })
    pendingPairingStore.get.mockResolvedValue(null)
    pendingPairingStore.set.mockResolvedValue(undefined)
    pendingPairingStore.clear.mockResolvedValue(undefined)
  })

  describe('hydration', () => {
    it('hydrates pairingToken from the store on mount', async () => {
      pendingPairingStore.get.mockResolvedValue('persisted-token-12345')
      const { result, cleanup } = renderHook(() => useDesktopPairing(props))

      await act(async () => {}) // flush the async mount effect

      expect(result.current.pairingToken).toBe('persisted-token-12345')
      expect(result.current.hydrated).toBe(true)
      cleanup()
    })

    it('sets hydrated=true with empty token when store has nothing', async () => {
      const { result, cleanup } = renderHook(() => useDesktopPairing(props))

      await act(async () => {})

      expect(result.current.pairingToken).toBe('')
      expect(result.current.hydrated).toBe(true)
      cleanup()
    })

    it('starts with hydrated=false before the mount effect resolves', () => {
      pendingPairingStore.get.mockReturnValue(new Promise(() => {})) // never resolves

      const { result, cleanup } = renderHook(() => useDesktopPairing(props))

      expect(result.current.hydrated).toBe(false)
      cleanup()
    })
  })

  describe('clear on fetchIdentity failure', () => {
    it('clears the store when identity fetch fails', async () => {
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: false,
        error: 'Some error'
      })

      const { result, cleanup } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('valid-token-12345')
      })
      await act(async () => {
        await result.current.fetchIdentity()
      })

      expect(pendingPairingStore.clear).toHaveBeenCalled()
      cleanup()
    })
  })

  describe('clear on successful pair', () => {
    it('clears the store after completePairing succeeds', async () => {
      const mockIdentity = { ed25519PublicKey: 'pk', x25519PublicKey: 'xk' }
      secureChannelMessages.getIdentity.mockResolvedValue({
        success: true,
        identity: mockIdentity
      })
      secureChannelMessages.confirmPair.mockResolvedValue({ confirmed: true })
      secureChannelMessages.unlockClientKeystore.mockResolvedValue({
        success: true
      })
      secureChannelMessages.pinIdentity.mockResolvedValue({ success: true })

      const { result, cleanup } = renderHook(() => useDesktopPairing(props))

      await act(async () => {
        result.current.setPairingToken('token-long-enough')
      })
      await act(async () => {
        await result.current.fetchIdentity()
      })
      await act(async () => {
        await result.current.completePairing('password')
      })

      expect(pendingPairingStore.clear).toHaveBeenCalled()
      cleanup()
    })
  })
})
