import { logger } from './logger.js'
import {
  redirectToPasskeySelection,
  shouldReturnToPasskeySelection
} from './passkeyNavigation.js'

// Mock the logger module
jest.mock('./logger.js', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn()
  }
}))

describe('shouldReturnToPasskeySelection', () => {
  it('returns true when inPasskeyFlow is true and page is set in router state', () => {
    const routerState = { inPasskeyFlow: true, page: 'getPasskey' }
    expect(shouldReturnToPasskeySelection(routerState)).toBe('getPasskey')
  })

  it('returns falsy when inPasskeyFlow is true but page is not set', () => {
    const routerState = { inPasskeyFlow: true }
    expect(shouldReturnToPasskeySelection(routerState)).toBeFalsy()
  })

  it('returns falsy when inPasskeyFlow is false', () => {
    const routerState = { inPasskeyFlow: false, page: 'getPasskey' }
    expect(shouldReturnToPasskeySelection(routerState)).toBeFalsy()
  })

  it('returns falsy when routerState is null', () => {
    expect(shouldReturnToPasskeySelection(null)).toBeFalsy()
  })

  it('returns falsy when routerState is undefined', () => {
    expect(shouldReturnToPasskeySelection()).toBeFalsy()
  })

  it('returns falsy when inPasskeyFlow is not present in router state', () => {
    const routerState = { someOtherProp: 'value' }
    expect(shouldReturnToPasskeySelection(routerState)).toBeFalsy()
  })
})

describe('redirectToPasskeySelection', () => {
  // Mock logger.error to test error handling
  beforeEach(() => {
    jest.clearAllMocks()
    logger.error = jest.fn()
  })

  it('navigates with correct parameters when both navigate and passkeyParams are provided', () => {
    const mockNavigate = jest.fn()
    const passkeyParams = {
      page: 'getPasskey',
      serializedPublicKey: 'abc123',
      requestId: 'req1',
      requestOrigin: 'example.com',
      tabId: '456',
      isVerified: true
    }

    redirectToPasskeySelection(mockNavigate, passkeyParams)

    expect(mockNavigate).toHaveBeenCalledWith('getPasskey', {
      state: {
        serializedPublicKey: 'abc123',
        requestId: 'req1',
        requestOrigin: 'example.com',
        tabId: '456',
        isVerified: true
      }
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs error and returns when navigate is null', () => {
    const passkeyParams = {
      page: 'getPasskey',
      serializedPublicKey: 'abc123',
      requestId: 'req1',
      requestOrigin: 'example.com',
      tabId: '456'
    }

    redirectToPasskeySelection(null, passkeyParams)

    expect(logger.error).toHaveBeenCalledWith(
      'redirectToPasskeySelection requires both navigate and passkeyParams'
    )
  })

  it('logs error and returns when passkeyParams is null', () => {
    const mockNavigate = jest.fn()

    redirectToPasskeySelection(mockNavigate, null)

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(
      'redirectToPasskeySelection requires both navigate and passkeyParams'
    )
  })

  it('logs error and returns when both parameters are null', () => {
    redirectToPasskeySelection(null, null)

    expect(logger.error).toHaveBeenCalledWith(
      'redirectToPasskeySelection requires both navigate and passkeyParams'
    )
  })
})
