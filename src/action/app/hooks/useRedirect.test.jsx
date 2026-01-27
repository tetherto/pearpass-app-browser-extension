import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserData, useVault, useVaults } from 'pearpass-lib-vault'

import { useRedirect } from './useRedirect'
import { useRouter } from '../../../shared/context/RouterContext'

jest.mock('pearpass-lib-vault', () => ({
  useUserData: jest.fn(),
  useVault: jest.fn(),
  useVaults: jest.fn()
}))
jest.mock('../../../shared/context/RouterContext', () => ({
  useRouter: jest.fn()
}))
jest.mock('../../../shared/context/ModalContext', () => ({
  useModal: jest.fn(() => ({
    setModal: jest.fn(),
    closeModal: jest.fn()
  }))
}))

jest.mock('../../../shared/context/BlockingStateContext', () => ({
  useBlockingStateContext: jest.fn(() => ({
    isChecking: false,
    blockingState: null
  }))
}))

describe('useRedirect', () => {
  let mockNavigate

  beforeEach(() => {
    mockNavigate = jest.fn()
    useRouter.mockReturnValue({
      navigate: mockNavigate,
      currentPage: null
    })
    useUserData.mockReturnValue({
      isLoading: false,
      data: {},
      refetch: jest.fn()
    })
    useVault.mockReturnValue({ isLoading: false, refetch: jest.fn() })
    useVaults.mockReturnValue({ isLoading: false, refetch: jest.fn() })

    const {
      useBlockingStateContext
    } = require('../../../shared/context/BlockingStateContext')
    useBlockingStateContext.mockReturnValue({
      isChecking: false,
      blockingState: null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return isLoading as true when any loading state is true', () => {
    useUserData.mockReturnValue({
      isLoading: true,
      data: {},
      refetch: jest.fn()
    })
    const { result } = renderHook(() => useRedirect())
    expect(result.current.isLoading).toBe(true)
  })

  it('should not redirect when blocking state is present', async () => {
    const {
      useBlockingStateContext
    } = require('../../../shared/context/BlockingStateContext')
    useBlockingStateContext.mockReturnValue({
      isChecking: false,
      blockingState: { type: 'PAIRING_REQUIRED' }
    })

    const refetchUser = jest.fn()
    useUserData.mockReturnValue({
      isLoading: false,
      data: {},
      refetch: refetchUser
    })
    useVault.mockReturnValue({ isLoading: false, refetch: jest.fn() })
    useVaults.mockReturnValue({ isLoading: false, refetch: jest.fn() })

    await act(async () => {
      renderHook(() => useRedirect())
    })

    // Should not navigate when blocking state is present
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should navigate to "vault" when userData conditions are met', async () => {
    const refetchVault = jest.fn().mockResolvedValue({})
    const refetchMasterVault = jest.fn().mockResolvedValue({})

    useUserData.mockReturnValue({
      isLoading: false,
      data: { hasPasswordSet: true, isLoggedIn: true, isVaultOpen: true },
      refetch: jest.fn().mockResolvedValue({
        hasPasswordSet: true,
        isLoggedIn: true,
        isVaultOpen: true
      })
    })
    useVault.mockReturnValue({ isLoading: false, refetch: refetchVault })
    useVaults.mockReturnValue({ isLoading: false, refetch: refetchMasterVault })

    await act(async () => {
      renderHook(() => useRedirect())
    })

    await waitFor(() => {
      expect(refetchVault).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('vault', {
        state: { recordType: 'all' }
      })
    })
  })

  it('should navigate to "welcome" with state "vaults" when user is logged in but vault is not open', async () => {
    const refetchMasterVault = jest.fn().mockResolvedValue({})

    useUserData.mockReturnValue({
      isLoading: false,
      data: { hasPasswordSet: true, isLoggedIn: true, isVaultOpen: false },
      refetch: jest.fn().mockResolvedValue({
        hasPasswordSet: true,
        isLoggedIn: true,
        isVaultOpen: false
      })
    })
    useVault.mockReturnValue({ isLoading: false, refetch: jest.fn() })
    useVaults.mockReturnValue({ isLoading: false, refetch: refetchMasterVault })

    await act(async () => {
      renderHook(() => useRedirect())
    })

    await waitFor(() => {
      expect(refetchMasterVault).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('welcome', {
        params: { state: 'vaults' }
      })
    })
  })

  it('should navigate to "welcome" with state "masterPassword" when user has not set a password', async () => {
    useUserData.mockReturnValue({
      isLoading: false,
      data: { hasPasswordSet: false, isLoggedIn: false, isVaultOpen: false },
      refetch: jest.fn().mockResolvedValue({
        hasPasswordSet: false,
        isLoggedIn: false,
        isVaultOpen: false
      })
    })
    useVault.mockReturnValue({ isLoading: false, refetch: jest.fn() })
    useVaults.mockReturnValue({ isLoading: false, refetch: jest.fn() })

    await act(async () => {
      renderHook(() => useRedirect())
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('welcome', {
        params: { state: 'masterPassword' }
      })
    })
  })
})
