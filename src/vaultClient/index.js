import EventEmitter from 'events'

import { COMMAND_NAMES, getCommandParams } from '../shared/commandDefinitions'
import {
  AVAILABILITY_CHECK,
  AVAILABILITY_ERROR_MESSAGES,
  DESKTOP_APP_STATUS,
  ERROR_CODES,
  NATIVE_MESSAGE_TYPES,
  PAIRING_REASONS,
  SPECIAL_COMMANDS,
  VAULT_CLIENT_CONFIG,
  VAULT_CLIENT_ERRORS,
  VAULT_CLIENT_EVENTS
} from '../shared/constants/nativeMessaging'
import { logger } from '../shared/utils/logger'

/**
 * Native Messaging Client for PearPass Vault
 * Communicates with the desktop app via Chrome Native Messaging API
 *
 * This client dynamically creates methods based on command definitions.
 *
 * @class
 * @param {Object} options - Configuration options for the client.
 * @param {boolean} [options.debugMode=false] - Whether to enable debug mode for logging.
 */
export class PearpassVaultClient extends EventEmitter {
  constructor({ debugMode = false } = {}) {
    super()

    this.debugMode = debugMode
    this.connected = false
    this.lastAvailabilityCheck = null

    this._log = (...args) => {
      if (this.debugMode) {
        logger.log(VAULT_CLIENT_CONFIG.LOG_PREFIX, ...args)
      }
    }

    this._logError = (...args) =>
      logger.error(VAULT_CLIENT_CONFIG.LOG_PREFIX, ...args)

    // Setup event listeners for messages from background script
    this._setupEventListeners()

    // Dynamically create methods for all commands
    this._createDynamicMethods()
  }

  /**
   * Setup event listeners for messages from background script
   */
  _setupEventListeners() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === NATIVE_MESSAGE_TYPES.EVENT) {
        this.emit(message.event, message.data)
      } else if (message.type === NATIVE_MESSAGE_TYPES.DISCONNECTED) {
        this.connected = false
        this.emit(VAULT_CLIENT_EVENTS.DISCONNECTED, message.error)
      }
    })
  }

  async connect() {
    if (this.connected) {
      this._log(VAULT_CLIENT_ERRORS.ALREADY_CONNECTED)
      return
    }

    try {
      const response = await this._sendMessage({
        type: NATIVE_MESSAGE_TYPES.CONNECT
      })

      if (response.success) {
        this.connected = true
        this._log('Connected to native host via background')
        this.emit(VAULT_CLIENT_EVENTS.CONNECTED)
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      this._logError(VAULT_CLIENT_ERRORS.FAILED_TO_CONNECT, error)
      throw error
    }
  }

  /**
   * Disconnect from the native messaging host
   */
  disconnect() {
    void this._sendMessage({
      type: NATIVE_MESSAGE_TYPES.DISCONNECT
    })
    this.connected = false
    this.emit(VAULT_CLIENT_EVENTS.DISCONNECTED)
  }

  /**
   * Send a message to the background script
   * @private
   */
  _sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message))
        }

        // Background always returns structured errors with codes
        if (response && !response.success && response.error) {
          const error = new Error(response.error)
          error.code = response.code || ERROR_CODES.UNKNOWN
          return reject(error)
        }

        resolve(response)
      })
    })
  }

  /**
   * Send a request to the native host via background script
   * @private
   */
  async _sendRequest(command, params = {}) {
    // Skip availability check for certain commands
    if (!this._shouldSkipAvailabilityCheck(command)) {
      await this.checkAndHandleAvailability(command)
    }

    if (!this.connected) {
      await this.connect()
    }

    try {
      const response = await this._sendMessage({
        type: NATIVE_MESSAGE_TYPES.REQUEST,
        command,
        params
      })

      if (response.success) {
        return response.result
      } else {
        // This shouldn't happen as _sendMessage handles it, but just in case
        const error = new Error(response.error)
        error.code = response.code || ERROR_CODES.UNKNOWN
        throw error
      }
    } catch (error) {
      this._logError(`Error in ${command}:`, error)

      // Handle specific error types based on code
      switch (error.code) {
        case ERROR_CODES.DESKTOP_NOT_AUTHENTICATED:
          this.emit(VAULT_CLIENT_EVENTS.DESKTOP_LOGOUT, {
            reason: PAIRING_REASONS.DESKTOP_NOT_AUTHENTICATED
          })
          break

        case ERROR_CODES.DESKTOP_APP_UNAVAILABLE:
        case ERROR_CODES.NATIVE_HOST_DISCONNECTED:
        case ERROR_CODES.CONNECTION_FAILED:
          this.lastAvailabilityCheck = null
          const availability = await this.checkAvailability()
          if (!availability.available) {
            const newError = this._createAvailabilityError(availability)
            throw newError
          }
          break

        // Session errors are handled by background which calls clearSession
        // We just propagate the error with its code
      }

      throw error
    }
  }

  /**
   * Check if the desktop app is available and running
   * @returns {Promise<{available: boolean, status: string, message: string}>}
   */
  async checkAvailability() {
    try {
      const response = await this._sendMessage({
        type: NATIVE_MESSAGE_TYPES.REQUEST,
        command: SPECIAL_COMMANDS.CHECK_AVAILABILITY,
        params: {}
      })

      if (response.success) {
        return response.result
      } else {
        return {
          available: false,
          status: DESKTOP_APP_STATUS.UNKNOWN,
          message: response.error
        }
      }
    } catch (error) {
      this._logError(VAULT_CLIENT_ERRORS.AVAILABILITY_CHECK_FAILED, error)
      return {
        available: false,
        status: DESKTOP_APP_STATUS.UNKNOWN,
        message: error.message
      }
    }
  }

  _shouldSkipAvailabilityCheck(command) {
    return AVAILABILITY_CHECK.SKIP_COMMANDS.includes(command)
  }

  async checkAndHandleAvailability(
    command = SPECIAL_COMMANDS.CHECK_AVAILABILITY
  ) {
    const now = Date.now()
    const needCheck =
      command === SPECIAL_COMMANDS.CHECK_AVAILABILITY ||
      !this.lastAvailabilityCheck ||
      now - this.lastAvailabilityCheck >
        VAULT_CLIENT_CONFIG.AVAILABILITY_CACHE_MS

    if (needCheck) {
      const availability = await this.checkAvailability()

      if (!availability.available) {
        const error = this._createAvailabilityError(availability)
        throw error
      }

      this.lastAvailabilityCheck = now
    }
  }

  _createAvailabilityError(availability) {
    const error = new Error(this._getAvailabilityErrorMessage(availability))
    error.code = ERROR_CODES.DESKTOP_APP_UNAVAILABLE
    error.status = availability.status
    return error
  }

  /**
   * Get a user-friendly error message based on availability status
   * @private
   */
  _getAvailabilityErrorMessage(availability) {
    switch (availability.status) {
      case DESKTOP_APP_STATUS.NOT_RUNNING:
        return AVAILABILITY_ERROR_MESSAGES.NOT_RUNNING
      case DESKTOP_APP_STATUS.INTEGRATION_DISABLED:
        return AVAILABILITY_ERROR_MESSAGES.INTEGRATION_DISABLED
      case DESKTOP_APP_STATUS.CONNECTING:
        return AVAILABILITY_ERROR_MESSAGES.CONNECTING
      default:
        return availability.message || AVAILABILITY_ERROR_MESSAGES.DEFAULT
    }
  }

  /**
   * Dynamically create methods for all commands
   * @private
   */
  _createDynamicMethods() {
    COMMAND_NAMES.forEach((commandName) => {
      this[commandName] = async (...args) => {
        this._log(`Calling ${commandName} with args:`, args)

        try {
          const params = getCommandParams(commandName, args)
          const result = await this._sendRequest(commandName, params)

          this._log(`${commandName} completed successfully:`, result)

          return result
        } catch (error) {
          this._logError(`Error in ${commandName}:`, error)

          // Session errors are handled by background script which triggers pairing modal
          // We just propagate the error with its code

          throw error
        }
      }
    })
  }
}
