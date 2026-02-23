import { renderHook, waitFor } from '@testing-library/react'
import { useVaultSync } from './useVaultSync'
import { useVault } from 'pearpass-lib-vault'
import { useRouter } from '../../../shared/context/RouterContext'
import { logger } from '../../../shared/utils/logger'

// Mock dependencies
jest.mock('pearpass-lib-vault', () => ({
  useVault: jest.fn()
}))

jest.mock('../../../shared/context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('../../../shared/utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('useVaultSync', () => {
  const mockSyncVault = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useVault as jest.Mock).mockReturnValue({
      syncVault: mockSyncVault
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      currentPage: 'home',
      navigate: mockNavigate
    })
  })

  it('should call syncVault on mount', async () => {
    renderHook(() => useVaultSync())

    await waitFor(() => {
      expect(mockSyncVault).toHaveBeenCalledTimes(1)
    })
  })

  it('should log error if syncVault fails', async () => {
    const error = new Error('Sync failed')
    mockSyncVault.mockRejectedValueOnce(error)

    renderHook(() => useVaultSync())

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Error syncing vault:', error)
    })
  })

  it('should re-sync if dependencies change', async () => {
    const { rerender } = renderHook(() => useVaultSync())

    await waitFor(() => {
      expect(mockSyncVault).toHaveBeenCalledTimes(1)
    })

    // Simulate page change
    ;(useRouter as jest.Mock).mockReturnValue({
      currentPage: 'settings',
      navigate: mockNavigate
    })

    rerender()

    await waitFor(() => {
      expect(mockSyncVault).toHaveBeenCalledTimes(2)
    })
  })
})
