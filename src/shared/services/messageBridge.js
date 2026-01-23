import { logger } from '../utils/logger'

/**
 * Message types for secure channel operations
 */
export const SECURE_MESSAGE_TYPES = Object.freeze({
  GET_IDENTITY: 'SECURE_CHANNEL_GET_IDENTITY',
  CONFIRM_PAIR: 'SECURE_CHANNEL_CONFIRM_PAIR',
  CHECK_PAIRED: 'SECURE_CHANNEL_CHECK_PAIRED',
  UNLOCK_CLIENT_KEYSTORE: 'SECURE_CHANNEL_UNLOCK_CLIENT_KEYSTORE'
})

/**
 * Standard message types
 */
export const MESSAGE_TYPES = Object.freeze({
  ...SECURE_MESSAGE_TYPES,
  LOGIN: 'login',
  GET_PENDING_LOGIN: 'getPendingLogin',
  CREATE_PASSKEY: 'createPasskey',
  GET_PASSKEY: 'getPasskey',
  SELECTED_PASSKEY: 'selectedPasskey',
  READY_FOR_PASSKEY_PAYLOAD: 'readyForPasskeyPayload',
  GET_ASSERTION_CREDENTIAL: 'getAssertionCredential',
  GET_CONDITIONAL_PASSKEY_REQUEST: 'getConditionalPasskeyRequest',
  AUTHENTICATE_WITH_PASSKEY: 'authenticateWithPasskey',
  GET_PLATFORM_INFO: 'GET_PLATFORM_INFO'
})

/**
 * Error codes for message bridge operations
 */
export const MESSAGE_ERROR_CODES = Object.freeze({
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  HANDLER_ERROR: 'HANDLER_ERROR'
})

class MessageBridgeError extends Error {
  constructor(message, code, originalError = null) {
    super(message)
    this.name = 'MessageBridgeError'
    this.code = code
    this.originalError = originalError
  }
}

/**
 * MessageBridge class for handling all chrome runtime messaging
 */
class MessageBridge {
  constructor() {
    this.defaultTimeout = 30000 // 30 seconds
    this.listeners = new Map()
  }

  /**
   * Send a message to the background script with proper error handling
   * @param {string} type - Message type
   * @param {Object} data - Message data
   * @param {Object} options - Options
   * @param {number} options.timeout - Timeout in milliseconds
   * @returns {Promise<any>}
   */
  async sendMessage(type, data = {}, options = {}) {
    const timeout = options.timeout || this.defaultTimeout

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new MessageBridgeError(
            `Message '${type}' timed out after ${timeout}ms`,
            MESSAGE_ERROR_CODES.TIMEOUT
          )
        )
      }, timeout)

      try {
        const message = { type, ...data }

        chrome.runtime.sendMessage(message, (response) => {
          clearTimeout(timeoutId)

          // Check for Chrome runtime errors
          if (chrome.runtime.lastError) {
            logger.error(
              'MessageBridge',
              `Runtime error for message '${type}':`,
              chrome.runtime.lastError
            )
            reject(
              new MessageBridgeError(
                chrome.runtime.lastError.message,
                MESSAGE_ERROR_CODES.RUNTIME_ERROR,
                chrome.runtime.lastError
              )
            )
            return
          }

          // Validate response
          if (!response) {
            logger.warn('MessageBridge', `Empty response for message '${type}'`)
            reject(
              new MessageBridgeError(
                `Empty response for message '${type}'`,
                MESSAGE_ERROR_CODES.INVALID_RESPONSE
              )
            )
            return
          }

          // Handle error responses
          if (response.error || response.success === false) {
            logger.error(
              'MessageBridge',
              `Handler error for message '${type}':`,
              response.error
            )
            reject(
              new MessageBridgeError(
                response.error || 'Handler error',
                MESSAGE_ERROR_CODES.HANDLER_ERROR,
                response
              )
            )
            return
          }

          // Success
          logger.log('MessageBridge', `Message '${type}' successful`)
          resolve(response)
        })
      } catch (error) {
        clearTimeout(timeoutId)
        logger.error(
          'MessageBridge',
          `Failed to send message '${type}':`,
          error
        )
        reject(
          new MessageBridgeError(
            `Failed to send message: ${error.message}`,
            MESSAGE_ERROR_CODES.RUNTIME_ERROR,
            error
          )
        )
      }
    })
  }

  /**
   * Register a message listener
   * @param {string} type - Message type to listen for
   * @param {Function} handler - Handler function
   */
  addListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(handler)
  }

  /**
   * Remove a message listener
   * @param {string} type - Message type
   * @param {Function} handler - Handler function to remove
   */
  removeListener(type, handler) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(handler)
    }
  }

  /**
   * Setup global message listener for incoming messages
   */
  setupGlobalListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { type } = message

      if (this.listeners.has(type)) {
        const handlers = this.listeners.get(type)
        handlers.forEach((handler) => {
          try {
            handler(message, sender, sendResponse)
          } catch (error) {
            logger.error(
              'MessageBridge',
              `Error in handler for '${type}':`,
              error
            )
          }
        })
        return true // Keep channel open for async response
      }
    })
  }
}

// Singleton instance
export const messageBridge = new MessageBridge()

// Convenience methods for specific message types

/**
 * Secure channel operations
 */
export const secureChannelMessages = {
  async getIdentity(pairingToken) {
    return messageBridge.sendMessage(SECURE_MESSAGE_TYPES.GET_IDENTITY, {
      pairingToken
    })
  },

  async confirmPair(identity) {
    return messageBridge.sendMessage(SECURE_MESSAGE_TYPES.CONFIRM_PAIR, {
      identity
    })
  },

  async checkPaired() {
    return messageBridge.sendMessage(SECURE_MESSAGE_TYPES.CHECK_PAIRED)
  },

  async unlockClientKeystore(masterPassword) {
    return messageBridge.sendMessage(
      SECURE_MESSAGE_TYPES.UNLOCK_CLIENT_KEYSTORE,
      {
        masterPassword
      }
    )
  }
}

/**
 * Passkey operations
 */
export const passkeyMessages = {
  async createPasskey(publicKey, requestOrigin, requestId, tabId) {
    return messageBridge.sendMessage(MESSAGE_TYPES.CREATE_PASSKEY, {
      publicKey,
      requestOrigin,
      requestId,
      tabId
    })
  },

  async getPasskey(publicKey, requestOrigin, requestId, tabId) {
    return messageBridge.sendMessage(MESSAGE_TYPES.GET_PASSKEY, {
      publicKey,
      requestOrigin,
      requestId,
      tabId
    })
  },

  async selectPasskey(requestId, selectedItem, tabId) {
    return messageBridge.sendMessage(MESSAGE_TYPES.SELECTED_PASSKEY, {
      requestId,
      selectedItem,
      tabId
    })
  },

  async getAssertionCredential(requestOrigin, serializedPublicKey, credential) {
    return messageBridge.sendMessage(MESSAGE_TYPES.GET_ASSERTION_CREDENTIAL, {
      requestOrigin,
      serializedPublicKey,
      credential
    })
  }
}

/**
 * Platform operations
 */
export const platformMessages = {
  async getPlatformInfo() {
    return messageBridge.sendMessage(MESSAGE_TYPES.GET_PLATFORM_INFO)
  }
}
