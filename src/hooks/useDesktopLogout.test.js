import { renderHook, act } from '@testing-library/react'
import { useVaults } from '@tetherto/pearpass-lib-vault'

import { useDesktopLogout } from './useDesktopLogout'
import { getClient } from '../shared/client'
import { VAULT_CLIENT_EVENTS } from '../shared/constants/nativeMessaging'
import { logger } from '../shared/utils/logger'

jest.mock('@tetherto/pearpass-lib-vault')
jest.mock('../shared/client', () => ({
  getClient: jest.fn()
}))
jest.mock('../shared/constants/nativeMessaging', () => ({
  VAULT_CLIENT_EVENTS: { DESKTOP_LOGOUT: 'DESKTOP_LOGOUT' }
}))
jest.mock('../shared/utils/logger')

describe('useDesktopLogout', () => {
  let vaultClientMock
  let resetVaultStateMock
  let onLogoutMock

  beforeEach(() => {
    resetVaultStateMock = jest.fn()
    useVaults.mockReturnValue({ resetState: resetVaultStateMock })

    vaultClientMock = {
      on: jest.fn(),
      off: jest.fn()
    }
    getClient.mockReturnValue(vaultClientMock)

    logger.log.mockClear()
    resetVaultStateMock.mockClear()
    vaultClientMock.on.mockClear()
    vaultClientMock.off.mockClear()
    onLogoutMock = jest.fn().mockResolvedValue()
  })

  it('registers and unregisters desktop logout event listener', () => {
    const { unmount } = renderHook(() =>
      useDesktopLogout({ onLogout: onLogoutMock })
    )
    expect(vaultClientMock.on).toHaveBeenCalledWith(
      VAULT_CLIENT_EVENTS.DESKTOP_LOGOUT,
      expect.any(Function)
    )
    unmount()
    expect(vaultClientMock.off).toHaveBeenCalledWith(
      VAULT_CLIENT_EVENTS.DESKTOP_LOGOUT,
      expect.any(Function)
    )
  })

  it('handles desktop logout event with string reason', async () => {
    renderHook(() => useDesktopLogout({ onLogout: onLogoutMock }))
    const handler = vaultClientMock.on.mock.calls[0][1]
    await act(async () => {
      await handler('manual-logout')
    })
    expect(logger.log).toHaveBeenCalledWith(
      'useDesktopLogout',
      'info',
      'Desktop logout event received: manual-logout'
    )
    expect(resetVaultStateMock).toHaveBeenCalled()
    expect(onLogoutMock).toHaveBeenCalled()
  })

  it('handles desktop logout event with object reason', async () => {
    renderHook(() => useDesktopLogout({ onLogout: onLogoutMock }))
    const handler = vaultClientMock.on.mock.calls[0][1]
    await act(async () => {
      await handler({ reason: 'inactivity' })
    })
    expect(logger.log).toHaveBeenCalledWith(
      'useDesktopLogout',
      'info',
      'Desktop logout event received: inactivity'
    )
    expect(resetVaultStateMock).toHaveBeenCalled()
    expect(onLogoutMock).toHaveBeenCalled()
  })

  it('handles desktop logout event with missing reason', async () => {
    renderHook(() => useDesktopLogout({ onLogout: onLogoutMock }))
    const handler = vaultClientMock.on.mock.calls[0][1]
    await act(async () => {
      await handler({})
    })
    expect(logger.log).toHaveBeenCalledWith(
      'useDesktopLogout',
      'info',
      'Desktop logout event received: desktop-unauthenticated'
    )
    expect(resetVaultStateMock).toHaveBeenCalled()
    expect(onLogoutMock).toHaveBeenCalled()
  })

  it('logs error if onLogout throws', async () => {
    onLogoutMock.mockRejectedValueOnce(new Error('fail'))
    renderHook(() => useDesktopLogout({ onLogout: onLogoutMock }))
    const handler = vaultClientMock.on.mock.calls[0][1]
    await act(async () => {
      await handler('manual-logout')
    })
    expect(logger.log).toHaveBeenCalledWith(
      'useDesktopLogout',
      'error',
      expect.stringContaining('Failed to handle desktop logout: fail')
    )
  })

  it('does nothing if getClient throws', () => {
    getClient.mockImplementationOnce(() => {
      throw new Error('not ready')
    })
    renderHook(() => useDesktopLogout({ onLogout: onLogoutMock }))
    expect(vaultClientMock.on).not.toHaveBeenCalled()
  })
})
