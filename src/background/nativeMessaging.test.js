// Mock dependencies before importing the module under test
jest.mock('./nativeMessagingProtocol', () => ({
  isWrappedMessage: jest.fn(),
  unwrapMessage: jest.fn(),
  wrapMessage: jest.fn()
}))
jest.mock('../shared/constants/nativeMessaging', () => {
  const actual = jest.requireActual('../shared/constants/nativeMessaging')

  return {
    ...actual,
    // Use shorter timeouts in tests so we can advance fake timers quickly.
    REQUEST_TIMEOUT: {
      ...actual.REQUEST_TIMEOUT,
      DEFAULT_MS: 1000,
      AVAILABILITY_CHECK_MS: 500
    },
    // Make debug logging deterministic and set a simple host name.
    NATIVE_MESSAGING_CONFIG: {
      ...actual.NATIVE_MESSAGING_CONFIG,
      DEBUG_MODE: true,
      LOG_PREFIX: '[NATIVE] ',
      HOST_NAME: 'test-host'
    }
  }
})

const { NATIVE_MESSAGE_TYPES } = require('../shared/constants/nativeMessaging')

jest.mock('../shared/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('../shared/constants/auth', () => ({
  AUTH_ERROR_PATTERNS: {
    MASTER_PASSWORD_REQUIRED: 'MasterPasswordRequired',
    MASTER_PASSWORD_INVALID: 'MasterPasswordInvalid'
  }
}))

// Provide a fake global chrome.runtime for testing
global.chrome = {
  runtime: {
    connectNative: jest.fn(),
    lastError: null,
    sendMessage: jest.fn(() => Promise.resolve()),
    onMessage: { addListener: jest.fn() },
    onDisconnect: { addListener: jest.fn() }
  }
}

describe('NativeMessaging & integration', () => {
  let nativeModule
  beforeEach(() => {
    // Reset modules to apply fresh mocks
    jest.resetModules()
    // Clear chrome mocks
    global.chrome.runtime.connectNative.mockReset()
    global.chrome.runtime.sendMessage.mockClear()
    global.chrome.runtime.lastError = null
    // Import after mocks
    nativeModule = require('./nativeMessaging')
  })

  test('connect() should call chrome.runtime.connectNative and resolve when not already connected', async () => {
    const fakePort = {
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() }
    }
    global.chrome.runtime.connectNative.mockReturnValue(fakePort)

    await expect(
      nativeModule.nativeMessaging.connect()
    ).resolves.toBeUndefined()
    expect(global.chrome.runtime.connectNative).toHaveBeenCalledWith(
      'test-host'
    )
    expect(fakePort.onMessage.addListener).toHaveBeenCalled()
    expect(fakePort.onDisconnect.addListener).toHaveBeenCalled()
  })

  test('connect() when already connected should resolve immediately without reconnecting', async () => {
    const fakePort = {
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() }
    }
    global.chrome.runtime.connectNative.mockReturnValue(fakePort)

    // First connect
    await nativeModule.nativeMessaging.connect()
    // Clear the mock and call again
    global.chrome.runtime.connectNative.mockClear()

    await expect(
      nativeModule.nativeMessaging.connect()
    ).resolves.toBeUndefined()
    expect(global.chrome.runtime.connectNative).not.toHaveBeenCalled()
  })

  test('sendRequest() should wrap and post message and resolve on response', async () => {
    // Arrange
    const { nativeMessaging } = nativeModule
    const {
      wrapMessage,
      isWrappedMessage,
      unwrapMessage
    } = require('./nativeMessagingProtocol')
    wrapMessage.mockImplementation((req) => ({ wrapped: req }))

    // Simulate connected state
    const fakePort = {
      postMessage: jest.fn(),
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() }
    }
    global.chrome.runtime.connectNative.mockReturnValue(fakePort)
    await nativeMessaging.connect()

    // Grab registered listener
    const messageListener = fakePort.onMessage.addListener.mock.calls[0][0]
    // Act: send a request
    const promise = nativeMessaging.sendRequest('TEST_CMD', { foo: 'bar' })
    // Wrap internals: simulate incoming message
    const responseMsg = { id: 1, result: { success: true }, success: true }
    const wrappedResponse = { wrapped: responseMsg }
    // isWrappedMessage -> true, unwrapMessage returns actual
    isWrappedMessage.mockReturnValue(true)
    unwrapMessage.mockReturnValue(responseMsg)

    // Simulate message event
    messageListener(wrappedResponse)

    // Assert
    await expect(promise).resolves.toEqual({ success: true })
    expect(fakePort.postMessage).toHaveBeenCalledWith({
      wrapped: { id: 1, command: 'TEST_CMD', params: { foo: 'bar' } }
    })
  })

  test('sendRequest() should reject on timeout', async () => {
    jest.useFakeTimers()
    const { nativeMessaging } = nativeModule

    // Simulate connected state
    const fakePort = {
      postMessage: jest.fn(),
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() }
    }
    global.chrome.runtime.connectNative.mockReturnValue(fakePort)
    await nativeMessaging.connect()

    const promise = nativeMessaging.sendRequest('OTHER_CMD')
    // Advance time past default timeout (1000ms)
    jest.advanceTimersByTime(1500)

    await expect(promise).rejects.toThrow('Request timeout: OTHER_CMD')
    jest.useRealTimers()
  })

  test('handleRequest does not clear session (secureChannel handles it)', async () => {
    const secureChannel = require('./secureChannel')

    // Message listener should be registered
    expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalled()

    // Replace secureChannel.ensureSession to simulate auth failure
    secureChannel.secureChannel.ensureSession = jest
      .fn()
      .mockRejectedValue(new Error('MasterPasswordRequired: please unlock'))
    secureChannel.secureChannel.secureRequest = jest.fn()
    secureChannel.secureChannel.clearSession = jest.fn()

    const messageListener =
      global.chrome.runtime.onMessage.addListener.mock.calls[0][0]

    await new Promise((resolve) => {
      messageListener(
        {
          type: NATIVE_MESSAGE_TYPES.REQUEST,
          command: 'securedCommand',
          params: {}
        },
        {},
        (response) => {
          expect(response.success).toBe(false)
          expect(response.code).toBeDefined()
          resolve(null)
        }
      )
    })

    // handleRequest never calls clearSession - secureChannel handles it
    expect(secureChannel.secureChannel.clearSession).not.toHaveBeenCalled()
  })
})
