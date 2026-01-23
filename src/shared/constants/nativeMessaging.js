import { MANIFEST_NAME } from 'pearpass-lib-constants'

/**
 * Error codes used throughout the application
 */
export const ERROR_CODES = {
  DESKTOP_APP_UNAVAILABLE: 'DESKTOP_APP_UNAVAILABLE',
  NATIVE_HOST_DISCONNECTED: 'NATIVE_HOST_DISCONNECTED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  VAULT_LOCKED: 'VAULT_LOCKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  SIGNATURE_INVALID: 'SIGNATURE_INVALID',
  DESKTOP_NOT_AUTHENTICATED: 'DESKTOP_NOT_AUTHENTICATED',
  IDENTITY_KEYS_UNAVAILABLE: 'IDENTITY_KEYS_UNAVAILABLE',
  NOT_PAIRED: 'NOT_PAIRED',
  HANDSHAKE_FAILED: 'HANDSHAKE_FAILED',
  NO_SESSION: 'NO_SESSION',
  METHOD_DEPRECATED: 'METHOD_DEPRECATED',
  UNKNOWN: 'UNKNOWN'
}

/**
 * Desktop app availability statuses
 */
export const DESKTOP_APP_STATUS = {
  NOT_RUNNING: 'not-running',
  INTEGRATION_DISABLED: 'integration-disabled',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  UNKNOWN: 'unknown'
}

/**
 * Native messaging types used for communication between extension and background script
 */
export const NATIVE_MESSAGE_TYPES = {
  CONNECT: 'NATIVE_CONNECT',
  DISCONNECT: 'NATIVE_DISCONNECT',
  REQUEST: 'NATIVE_REQUEST',
  EVENT: 'NATIVE_EVENT',
  DISCONNECTED: 'NATIVE_DISCONNECTED'
}

/**
 * Special commands that have specific handling
 */
export const SPECIAL_COMMANDS = {
  CHECK_AVAILABILITY: 'checkAvailability'
}

/**
 * Availability check configuration
 */
export const AVAILABILITY_CHECK = {
  INTERVAL_MS: 5000, // Check every 5 seconds
  SKIP_COMMANDS: [SPECIAL_COMMANDS.CHECK_AVAILABILITY] // Commands that don't require availability check
}

/**
 * Request timeout configuration
 */
export const REQUEST_TIMEOUT = {
  DEFAULT_MS: 10000, // 10 seconds default timeout
  AVAILABILITY_CHECK_MS: 3000, // 3 seconds for availability check
  CONNECT_MS: 5000 // 5 seconds for connection
}

/**
 * Error messages that indicate disconnection
 */
export const DISCONNECTION_ERROR_MESSAGES = {
  NATIVE_HOST_DISCONNECTED: 'Native messaging host disconnected',
  CONNECTION_FAILED: 'Connection failed',
  IPC_DISCONNECTED: 'IPC disconnected',
  DESKTOP_APP_NOT_AVAILABLE: 'Desktop app not available',
  REQUEST_TIMEOUT: 'Request timeout'
}

/**
 * User-friendly error messages for desktop app availability issues
 */
export const AVAILABILITY_ERROR_MESSAGES = {
  NOT_RUNNING:
    'Desktop app is not running. Please start the PearPass desktop app and try again.',
  INTEGRATION_DISABLED:
    'Unable to connect to desktop app. Please ensure the PearPass desktop app is running and browser extension integration is enabled in Privacy settings.',
  CONNECTING: 'Connecting to desktop app. Please wait...',
  DEFAULT:
    'Unable to connect to desktop app. Please ensure the PearPass desktop app is running.'
}

/**
 * Vault error handler constants
 */
export const VAULT_ERROR_MESSAGES = {
  VAULT_OPERATION_ERROR: 'Vault operation error:',
  DESKTOP_CONNECTION_ERROR: 'Unable to connect to desktop app'
}

/**
 * Navigation constants for vault error handling
 */
export const VAULT_NAVIGATION = {
  WELCOME_ROUTE: 'welcome',
  MASTER_PASSWORD_STATE: 'masterPassword'
}

/**
 * Native messaging configuration
 */
export const NATIVE_MESSAGING_CONFIG = {
  HOST_NAME: MANIFEST_NAME,
  DEBUG_MODE: false,
  LOG_PREFIX: '[NativeMessaging]',
  PROTOCOL_PREFIX: '[Protocol]'
}

/**
 * Native messaging error messages
 */
export const NATIVE_MESSAGING_ERRORS = {
  ALREADY_CONNECTED: 'Already connected',
  FAILED_TO_CONNECT: 'Failed to connect',
  REQUEST_TIMEOUT: 'Request timeout',
  DISCONNECTED: 'Disconnected from native host',
  INVALID_MESSAGE_STRUCTURE: 'Invalid message structure',
  LENGTH_MISMATCH: 'Length mismatch',
  FAILED_TO_UNWRAP: 'Failed to unwrap message'
}

/**
 * Vault client configuration
 */
export const VAULT_CLIENT_CONFIG = {
  DEBUG_MODE: false,
  LOG_PREFIX: '[VaultClient]',
  AVAILABILITY_CACHE_MS: 5000
}

/**
 * Vault client error messages
 */
export const VAULT_CLIENT_ERRORS = {
  ALREADY_CONNECTED: 'Already connected',
  FAILED_TO_CONNECT: 'Failed to connect',
  CONNECTION_ERROR: 'Connection error',
  AVAILABILITY_CHECK_FAILED: 'Error checking availability',
  DISCONNECTION_DETECTED: 'Disconnection detected'
}

/**
 * Event names emitted by the VaultClient
 */
export const VAULT_CLIENT_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  PAIRING_REQUIRED: 'pairing-required',
  DESKTOP_LOGOUT: 'desktop-logout'
}

/**
 * Message types for background script communication
 */
export const BACKGROUND_MESSAGE_TYPES = {
  PAIRING_REQUIRED: 'PAIRING_REQUIRED'
}

/**
 * Content script message types
 */
export const CONTENT_MESSAGE_TYPES = {
  SAVED_PASSKEY: 'savedPasskey',
  CREATE_THIRD_PARTY_KEY: 'createThirdPartyKey',
  GOT_PASSKEY: 'gotPasskey',
  GET_THIRD_PARTY_KEY: 'getThirdPartyKey',
  AUTOFILL_FROM_ACTION: 'autofillFromAction',
  CREATE_PASSKEY: 'createPasskey',
  GET_PASSKEY: 'getPasskey'
}

/**
 * Security error patterns to match against error messages
 */
export const SECURITY_ERROR_PATTERNS = {
  SIGNATURE_INVALID: 'SignatureInvalid',
  DESKTOP_NOT_AUTHENTICATED: 'DesktopNotAuthenticated',
  IDENTITY_KEYS_UNAVAILABLE: 'IdentityKeysUnavailable',
  CLIENT_SIGNATURE_INVALID: 'ClientSignatureInvalid'
}

/**
 * Session error patterns to match against error messages
 */
export const SESSION_ERROR_PATTERNS = {
  NOT_PAIRED: 'NotPaired',
  DECRYPT_FAILED: 'DecryptFailed',
  SESSION_NOT_FOUND: 'SessionNotFound',
  HANDSHAKE_FAILED: 'HandshakeFailed',
  HANDSHAKE_FINISH_FAILED: 'HandshakeFinishFailed',
  SECURE_REQUEST_FAILED: 'SecureRequestFailed',
  NO_SESSION: 'NoSession'
}

/**
 * Pairing and authentication reasons
 */
export const PAIRING_REASONS = {
  SIGNATURE_INVALID: 'signature-invalid',
  DESKTOP_NOT_AUTHENTICATED: 'desktop-not-authenticated',
  IDENTITY_KEYS_UNAVAILABLE: 'identity-keys-unavailable',
  NOT_PAIRED: 'not-paired',
  DECRYPT_FAILED: 'decrypt-failed',
  SESSION_NOT_FOUND: 'session-not-found',
  HANDSHAKE_FAILED: 'handshake-failed',
  SECURE_REQUEST_FAILED: 'secure-request-failed'
}

/**
 * Protocol domain separation tags for handshake transcript binding
 * These prevent cross-protocol signature replay attacks
 */
export const PROTOCOL_TAGS = {
  CLIENT_FINISH: 'pearpass/handshake/v1/clientFinish'
}
