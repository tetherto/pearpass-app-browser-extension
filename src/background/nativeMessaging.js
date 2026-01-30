import {
  isWrappedMessage,
  unwrapMessage,
  wrapMessage
} from './nativeMessagingProtocol'
import { secureChannel } from './secureChannel'
import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import {
  NATIVE_MESSAGE_TYPES,
  NATIVE_MESSAGING_CONFIG,
  NATIVE_MESSAGING_ERRORS,
  REQUEST_TIMEOUT,
  SPECIAL_COMMANDS,
  SESSION_ERROR_PATTERNS,
  SECURITY_ERROR_PATTERNS,
  ERROR_CODES,
  DISCONNECTION_ERROR_MESSAGES,
  DESKTOP_APP_STATUS
} from '../shared/constants/nativeMessaging'
import { logger } from '../shared/utils/logger'
import { runtime } from '../shared/utils/runtime'

const createError = (message) => new Error(message)

const createTimeoutError = (command) =>
  createError(`${NATIVE_MESSAGING_ERRORS.REQUEST_TIMEOUT}: ${command}`)

const createDisconnectionError = (lastError) =>
  createError(lastError?.message || NATIVE_MESSAGING_ERRORS.DISCONNECTED)

const log = (...args) => {
  if (NATIVE_MESSAGING_CONFIG.DEBUG_MODE) {
    logger.log(NATIVE_MESSAGING_CONFIG.LOG_PREFIX, ...args)
  }
}

const logError = (...args) =>
  logger.error(NATIVE_MESSAGING_CONFIG.LOG_PREFIX, ...args)
const getTimeoutForCommand = (command) => {
  switch (command) {
    case SPECIAL_COMMANDS.CHECK_AVAILABILITY:
      return REQUEST_TIMEOUT.AVAILABILITY_CHECK_MS
    case SPECIAL_COMMANDS.PAIR_ACTIVE_VAULT:
      return REQUEST_TIMEOUT.PAIRING_MS
    default:
      return REQUEST_TIMEOUT.DEFAULT_MS
  }
}

class NativeMessagingHandler {
  constructor() {
    this.port = null
    this.requestId = 0
    this.pendingRequests = new Map()
    this.connected = false
  }

  connect() {
    if (this.connected) {
      log(NATIVE_MESSAGING_ERRORS.ALREADY_CONNECTED)
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        log('Connecting to native host:', NATIVE_MESSAGING_CONFIG.HOST_NAME)
        this.port = runtime.connectNative(NATIVE_MESSAGING_CONFIG.HOST_NAME)

        this.port.onMessage.addListener(this._handleMessage.bind(this))
        this.port.onDisconnect.addListener(this._handleDisconnect.bind(this))

        this.connected = true
        log('Connected to native host')
        resolve()
      } catch (error) {
        logError(NATIVE_MESSAGING_ERRORS.FAILED_TO_CONNECT, error)
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.port) {
      this.port.disconnect()
      this.port = null
    }
    this.connected = false
    this._clearPendingRequests()
  }

  /**
   * Send a request to the native host
   * @param {string} command - The command to send
   * @param {Object} params - The parameters to send
   * @param {number} timeout - The timeout in milliseconds
   * @returns {Promise<any>} The result of the request
   */
  sendRequest(command, params = {}, timeout = REQUEST_TIMEOUT.DEFAULT_MS) {
    if (!this.connected) {
      return this.connect().then(() =>
        this.sendRequest(command, params, timeout)
      )
    }

    return new Promise((resolve, reject) => {
      const id = ++this.requestId
      const request = { id, command, params }

      const timeoutId = setTimeout(() => {
        this._handleRequestTimeout(id, command)
      }, timeout)

      this.pendingRequests.set(id, { resolve, reject, timeoutId })

      try {
        const wrappedRequest = wrapMessage(request)
        this.port.postMessage(wrappedRequest)
        log('Sent wrapped request:', wrappedRequest)
      } catch (error) {
        this._cleanupRequest(id)
        reject(error)
      }
    })
  }

  _handleRequestTimeout(id, command) {
    if (this.pendingRequests.has(id)) {
      const { reject } = this.pendingRequests.get(id)
      this.pendingRequests.delete(id)
      reject(createTimeoutError(command))
    }
  }

  _cleanupRequest(id) {
    const request = this.pendingRequests.get(id)
    if (request) {
      clearTimeout(request.timeoutId)
      this.pendingRequests.delete(id)
    }
  }

  _clearPendingRequests() {
    this.pendingRequests.clear()
  }

  _handleMessage(message) {
    const actualMessage = this._processMessage(message)
    if (!actualMessage) return

    if (actualMessage.id && this.pendingRequests.has(actualMessage.id)) {
      this._handleResponse(actualMessage)
    } else if (actualMessage.event) {
      this._handleEvent(actualMessage)
    }
  }

  _processMessage(message) {
    if (isWrappedMessage(message)) {
      const unwrapped = unwrapMessage(message)
      if (!unwrapped) {
        logError(NATIVE_MESSAGING_ERRORS.FAILED_TO_UNWRAP)
        return null
      }
      log('Unwrapped message:', unwrapped)
      return unwrapped
    }

    log('Received message:', message)
    return message
  }

  _handleResponse(message) {
    const { resolve, reject, timeoutId } = this.pendingRequests.get(message.id)
    this.pendingRequests.delete(message.id)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (message.success === false || message.error) {
      reject(createError(message.error))
    } else {
      resolve(message.result)
    }
  }

  _handleEvent(message) {
    runtime
      .sendMessage({
        type: NATIVE_MESSAGE_TYPES.EVENT,
        event: message.event,
        data: message.data
      })
      .catch((error) => {
        log('Failed to forward event to extension:', error?.message || error)
      })
  }

  _handleDisconnect() {
    const error = runtime.lastError
    logError(NATIVE_MESSAGING_ERRORS.DISCONNECTED, error)

    this._rejectAllPendingRequests(error)
    this._reset()
    this._notifyDisconnection(error)
  }

  _rejectAllPendingRequests(error) {
    for (const { reject } of this.pendingRequests.values()) {
      reject(createDisconnectionError(error))
    }
    this.pendingRequests.clear()
  }

  _reset() {
    this.connected = false
    this.port = null
  }

  _notifyDisconnection(error) {
    runtime
      .sendMessage({
        type: NATIVE_MESSAGE_TYPES.DISCONNECTED,
        error: error?.message
      })
      .catch((notifyError) => {
        log(
          'Failed to notify disconnection:',
          notifyError?.message || notifyError
        )
      })
  }
}

const nativeMessaging = new NativeMessagingHandler()

const SECURE_EXEMPT_COMMANDS = new Set([
  SPECIAL_COMMANDS.CHECK_AVAILABILITY,
  'nmGetAppIdentity',
  'nmBeginHandshake',
  'nmFinishHandshake',
  'nmSecureRequest',
  'nmCloseSession'
])

const shouldSecure = (command) => !SECURE_EXEMPT_COMMANDS.has(command)

/**
 * Determine the error code based on the error message
 * @param {string} errorMessage - The error message to analyze
 * @returns {string} The appropriate error code
 */
const getErrorCode = (errorMessage) => {
  if (!errorMessage) return ERROR_CODES.UNKNOWN

  // Check for security errors
  if (errorMessage.includes(SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID)) {
    return ERROR_CODES.SIGNATURE_INVALID
  }
  if (
    errorMessage.includes(SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE)
  ) {
    return ERROR_CODES.IDENTITY_KEYS_UNAVAILABLE
  }
  if (
    errorMessage.includes(SECURITY_ERROR_PATTERNS.DESKTOP_NOT_AUTHENTICATED)
  ) {
    return ERROR_CODES.DESKTOP_NOT_AUTHENTICATED
  }
  if (errorMessage.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)) {
    return ERROR_CODES.AUTHENTICATION_FAILED
  }
  if (errorMessage.includes(SECURITY_ERROR_PATTERNS.CLIENT_SIGNATURE_INVALID)) {
    return ERROR_CODES.SIGNATURE_INVALID
  }

  // Check for session errors
  if (errorMessage.includes(SESSION_ERROR_PATTERNS.NOT_PAIRED)) {
    return ERROR_CODES.NOT_PAIRED
  }
  if (errorMessage.includes(SESSION_ERROR_PATTERNS.NO_SESSION)) {
    return ERROR_CODES.NO_SESSION
  }
  if (errorMessage.includes(SESSION_ERROR_PATTERNS.SESSION_NOT_FOUND)) {
    return ERROR_CODES.NO_SESSION
  }
  if (errorMessage.includes(SESSION_ERROR_PATTERNS.DECRYPT_FAILED)) {
    return ERROR_CODES.NO_SESSION
  }
  if (
    errorMessage.includes(SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED) ||
    errorMessage.includes(SESSION_ERROR_PATTERNS.HANDSHAKE_FINISH_FAILED)
  ) {
    return ERROR_CODES.HANDSHAKE_FAILED
  }
  if (errorMessage.includes(SESSION_ERROR_PATTERNS.SECURE_REQUEST_FAILED)) {
    return ERROR_CODES.NO_SESSION
  }

  // Check for disconnection errors
  if (
    errorMessage.includes(
      DISCONNECTION_ERROR_MESSAGES.NATIVE_HOST_DISCONNECTED
    ) ||
    errorMessage.includes(DISCONNECTION_ERROR_MESSAGES.CONNECTION_FAILED) ||
    errorMessage.includes(
      DISCONNECTION_ERROR_MESSAGES.DESKTOP_APP_NOT_AVAILABLE
    ) ||
    errorMessage.includes(DESKTOP_APP_STATUS.NOT_RUNNING) ||
    errorMessage.includes(DESKTOP_APP_STATUS.INTEGRATION_DISABLED)
  ) {
    return ERROR_CODES.DESKTOP_APP_UNAVAILABLE
  }

  if (errorMessage.includes(DISCONNECTION_ERROR_MESSAGES.REQUEST_TIMEOUT)) {
    return ERROR_CODES.REQUEST_TIMEOUT
  }

  return ERROR_CODES.UNKNOWN
}

const handleRequest = async (msg, sendResponse) => {
  const { command, params: msgParams } = msg
  const timeout = getTimeoutForCommand(command)
  const params = { ...msgParams, timeout }

  try {
    let result
    // Only secure if paired and command is not exempt
    if (shouldSecure(command)) {
      await secureChannel.ensureSession()
      result = await secureChannel.secureRequest({
        method: command,
        params,
        timeout
      })
    } else {
      result = await nativeMessaging.sendRequest(command, params, timeout)
    }

    sendResponse({ success: true, result })
  } catch (error) {
    // Session clearing is handled by secureChannel - just propagate error
    sendResponse({
      success: false,
      error: error.message,
      code: getErrorCode(error.message)
    })
  }
}

const handleConnect = async (msg, sendResponse) => {
  try {
    await nativeMessaging.connect()
    sendResponse({ success: true })
  } catch (error) {
    const errorCode = getErrorCode(error.message)
    sendResponse({
      success: false,
      error: error.message,
      code: errorCode
    })
  }
}

const handleDisconnect = (msg, sendResponse) => {
  nativeMessaging.disconnect()
  sendResponse({ success: true })
}

const messageHandlers = {
  [NATIVE_MESSAGE_TYPES.REQUEST]: handleRequest,
  [NATIVE_MESSAGE_TYPES.CONNECT]: handleConnect,
  [NATIVE_MESSAGE_TYPES.DISCONNECT]: handleDisconnect
}

runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const handler = messageHandlers[msg.type]
  if (handler) {
    handler(msg, sendResponse)
    return true
  }
})

export { nativeMessaging }
