import './nativeMessaging' // Initialize native messaging handler
import { ensureClientKeypairUnlocked } from './clientKeyStore'
import { MESSAGES, ALARMS } from './constants'
import { secureChannel } from './secureChannel'
import * as CredentialGenerator from './utils/credentialGenerator'
import { validateSender } from './utils/validateSender'
import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import { CRYPTO_ALGORITHMS, ELLIPTIC_CURVES } from '../shared/constants/crypto'
import {
  ERROR_CODES,
  CONTENT_MESSAGE_TYPES,
  PAIRING_ERROR_PATTERNS
} from '../shared/constants/nativeMessaging'
import { passkeyWindowSize } from '../shared/constants/windowSizes'
import {
  MESSAGE_TYPES,
  SECURE_MESSAGE_TYPES
} from '../shared/services/messageBridge'
import { arrayBufferToBase64Url } from '../shared/utils/arrayBufferToBase64Url'
import { base64UrlToArrayBuffer } from '../shared/utils/base64UrlToArrayBuffer'
import { logger } from '../shared/utils/logger'
import { runtime } from '../shared/utils/runtime'

const { SCHEDULE_CLIPBOARD_CLEAR, CLEAR_CLIPBOARD_NOW } = MESSAGES
const { CLEAR_CLIPBOARD } = ALARMS

const pending = new Map()
const conditionalPasskeyRequests = new Map()

// Initialize secure session on startup if already paired
runtime.onStartup?.addListener(async () => {
  try {
    if (await secureChannel.isPaired()) {
      await secureChannel.ensureSession()
    }
  } catch (error) {
    logger.log('Failed to ensure session on startup:', error?.message || error)
  }
})

// Gracefully close session when service worker is suspended
runtime.onSuspend?.addListener(() => {
  if (secureChannel.hasActiveSession()) {
    void secureChannel.closeSession(secureChannel._session.id)
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return
  }

  if (!secureChannel.hasActiveSession()) {
    return
  }

  try {
    const autoLockSettings = await secureChannel.getAutoLockSettings()
    const { autoLockEnabled, autoLockTimeoutMs } = autoLockSettings
    await chrome.storage.local.set({
      autoLockEnabled,
      autoLockTimeoutMs
    })
  } catch (error) {
    logger.error('[AutoLock] Failed to fetch settings on focus', error)
  }
})

const ensureClipboardOffscreenDocument = async () => {
  try {
    const hasDocument = await chrome.offscreen.hasDocument()
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: runtime.getURL('offscreen.html'),
        reasons: ['CLIPBOARD'],
        justification: 'Clear clipboard contents after timeout.'
      })
      return true
    }

    return true
  } catch (error) {
    logger.error('[Clipboard] Failed to create offscreen document', error)
    return false
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CLEAR_CLIPBOARD) {
    try {
      const offscreenReady = await ensureClipboardOffscreenDocument()
      if (!offscreenReady) {
        logger.error(
          '[Clipboard] Failed to ensure offscreen document for alarm'
        )
        return
      }
      runtime.sendMessage({
        type: CLEAR_CLIPBOARD_NOW
      })
    } catch (error) {
      logger.error('[Clipboard] Failed to handle clipboard clear alarm', error)
    }
  }
})

runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const sensitiveTypes = [
    ...Object.values(SECURE_MESSAGE_TYPES),
    MESSAGE_TYPES.READY_FOR_PASSKEY_PAYLOAD,
    MESSAGE_TYPES.GET_ASSERTION_CREDENTIAL
  ]

  if (sensitiveTypes.includes(msg.type)) {
    if (!validateSender(sender, 'extension-page')) {
      sendResponse({ success: false, error: 'Unauthorized' })
      return
    }
  }

  const contentScriptTypes = [
    MESSAGE_TYPES.LOGIN,
    MESSAGE_TYPES.GET_PENDING_LOGIN,
    MESSAGE_TYPES.CREATE_PASSKEY,
    MESSAGE_TYPES.GET_PASSKEY,
    MESSAGE_TYPES.GET_CONDITIONAL_PASSKEY_REQUEST,
    MESSAGE_TYPES.AUTHENTICATE_WITH_PASSKEY
  ]

  if (contentScriptTypes.includes(msg.type)) {
    if (!validateSender(sender, 'content-script')) {
      sendResponse({ success: false, error: 'Unauthorized' })
      return
    }
  }

  switch (msg.type) {
    case MESSAGE_TYPES.LOGIN: {
      handleLoginMessage({ msg, sender })
      return
    }

    case MESSAGE_TYPES.GET_PENDING_LOGIN: {
      handleGetPendingLogin({ msg, sender, sendResponse })
      return
    }

    case MESSAGE_TYPES.CREATE_PASSKEY: {
      const queryParams = new URLSearchParams({
        requestId: msg.requestId,
        tabId: sender.tab.id,
        page: msg.type,
        serializedPublicKey: JSON.stringify(msg.publicKey),
        requestOrigin: msg.requestOrigin
      })

      openPasskeyWindow(queryParams)
      return true
    }

    case MESSAGE_TYPES.GET_AUTO_LOCK_SETTINGS: {
      if (!secureChannel.hasActiveSession()) {
        sendResponse({
          success: false,
          error: 'SESSION_NOT_READY'
        })
        return false
      }

      void (async () => {
        try {
          const autoLockSettings = await secureChannel.getAutoLockSettings()
          sendResponse({ success: true, autoLockSettings })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()

      return true
    }

    case MESSAGE_TYPES.SET_AUTO_LOCK_ENABLED: {
      void (async () => {
        try {
          await secureChannel.setAutoLockEnabled(msg.autoLockEnabled)
          await chrome.storage.local.set({
            autoLockEnabled: msg.autoLockEnabled
          })
          sendResponse({ ok: true })
        } catch (err) {
          logger.error(err)
          sendResponse({ ok: false, error: String(err) })
        }
      })()

      return true
    }

    case MESSAGE_TYPES.SET_AUTO_LOCK_TIMEOUT: {
      void (async () => {
        try {
          await secureChannel.setAutoLockTimeout(msg.autoLockTimeoutMs)
          await chrome.storage.local.set({
            autoLockTimeoutMs: msg.autoLockTimeoutMs
          })
          sendResponse({ ok: true })
        } catch (err) {
          logger.error(err)
          sendResponse({ ok: false, error: String(err) })
        }
      })()

      return true
    }

    case MESSAGE_TYPES.RESET_TIMER: {
      void (async () => {
        try {
          await secureChannel.resetTimer()
          sendResponse({ ok: true })
        } catch (err) {
          logger.error(err)
          sendResponse({ ok: false, error: String(err) })
        }
      })()
      return true
    }

    case MESSAGE_TYPES.GET_PASSKEY: {
      // Check if this is a conditional UI request (passive autofill)
      if (msg.mediation === 'conditional') {
        // Store the conditional request so autofill UI can use it
        conditionalPasskeyRequests.set(sender.tab.id, {
          requestId: msg.requestId,
          publicKey: msg.publicKey,
          requestOrigin: msg.requestOrigin,
          timestamp: Date.now()
        })
        logger.log('Stored conditional UI passkey request for autofill')

        return false
      }

      const queryParams = new URLSearchParams({
        requestId: msg.requestId,
        tabId: sender.tab.id,
        page: msg.type,
        serializedPublicKey: JSON.stringify(msg.publicKey),
        requestOrigin: msg.requestOrigin
      })

      openPasskeyWindow(queryParams)
      return true
    }

    case MESSAGE_TYPES.GET_CONDITIONAL_PASSKEY_REQUEST: {
      const request = conditionalPasskeyRequests.get(sender.tab.id) || null
      sendResponse({ request, tabId: sender.tab.id })
      return true
    }

    case MESSAGE_TYPES.AUTHENTICATE_WITH_PASSKEY: {
      const { credential, tabId } = msg
      const request = conditionalPasskeyRequests.get(tabId)

      if (!request) {
        logger.error('No conditional passkey request found for tab', tabId)
        sendResponse({ success: false, error: 'No request found' })
        return true
      }

      void getAssertionCredential(
        request.requestOrigin,
        JSON.stringify(request.publicKey),
        credential
      )
        .then((assertionCredential) => {
          chrome.tabs.sendMessage(parseInt(tabId), {
            type: CONTENT_MESSAGE_TYPES.GOT_PASSKEY,
            requestId: request.requestId,
            credential: assertionCredential
          })

          conditionalPasskeyRequests.delete(tabId)

          sendResponse({ success: true, credential: assertionCredential })
        })
        .catch((error) => {
          logger.error('Failed to get assertion credential:', error)
          sendResponse({ success: false, error: error.message })
        })

      return true
    }

    case MESSAGE_TYPES.SELECTED_PASSKEY: {
      handlePasskeyCreated({ msg })
      return
    }

    case MESSAGE_TYPES.READY_FOR_PASSKEY_PAYLOAD: {
      const { requestOrigin, serializedPublicKey } = msg
      void sendPasskeyPayload(requestOrigin, serializedPublicKey, sendResponse)
      return true
    }

    case MESSAGE_TYPES.GET_ASSERTION_CREDENTIAL: {
      const {
        requestOrigin,
        serializedPublicKey,
        credential: savedCredential
      } = msg

      getAssertionCredential(
        requestOrigin,
        serializedPublicKey,
        savedCredential
      )
        .then((assertionCredential) => {
          sendResponse({
            success: true,
            assertionCredential
          })
        })
        .catch((error) => {
          logger.error('Failed to get assertion credential:', error)
          sendResponse({
            success: false,
            error: error?.message || 'Failed to get assertion credential'
          })
        })

      return true
    }

    case MESSAGE_TYPES.GET_IDENTITY: {
      void (async () => {
        try {
          const { pairingToken } = msg
          if (!pairingToken) {
            sendResponse({
              success: false,
              error: PAIRING_ERROR_PATTERNS.PAIRING_TOKEN_REQUIRED,
              code: ERROR_CODES.INVALID_REQUEST
            })
            return
          }
          const identity = await secureChannel.getAppIdentity(pairingToken)
          sendResponse({ success: true, identity })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()
      return true
    }

    case MESSAGE_TYPES.CONFIRM_PAIR: {
      void (async () => {
        try {
          const { confirmed } = await secureChannel.confirmPairing()
          sendResponse({ success: true, confirmed })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()
      return true
    }

    case SECURE_MESSAGE_TYPES.PIN_IDENTITY: {
      void (async () => {
        try {
          await secureChannel.pinIdentity(msg.identity)
          sendResponse({ success: true })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()
      return true
    }

    case SECURE_MESSAGE_TYPES.UNPAIR: {
      void (async () => {
        try {
          await secureChannel.unpair()
          sendResponse({ success: true })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()
      return true
    }

    case SECURE_MESSAGE_TYPES.UNLOCK_CLIENT_KEYSTORE: {
      void (async () => {
        try {
          const { masterPassword } = msg
          if (!masterPassword) {
            sendResponse({
              success: false,
              error: AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED,
              code: ERROR_CODES.AUTHENTICATION_FAILED
            })
            return
          }
          await ensureClientKeypairUnlocked(masterPassword)
          sendResponse({ success: true })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.AUTHENTICATION_FAILED
          })
        }
      })()
      return true
    }

    case SECURE_MESSAGE_TYPES.GET_BLOCKING_STATE: {
      void (async () => {
        try {
          const blockingState = await secureChannel.getBlockingState()
          sendResponse({ success: true, blockingState })
        } catch (e) {
          sendResponse({
            success: false,
            error: e?.message,
            code: ERROR_CODES.UNKNOWN
          })
        }
      })()
      return true
    }

    case MESSAGE_TYPES.GET_PLATFORM_INFO: {
      runtime.getPlatformInfo((info) => {
        sendResponse(info)
      })
      return true
    }

    case SCHEDULE_CLIPBOARD_CLEAR: {
      void (async () => {
        await chrome.alarms.clear(CLEAR_CLIPBOARD)
        const when = Date.now() + msg.delayMs
        await chrome.alarms.create(CLEAR_CLIPBOARD, { when })
        sendResponse({ success: true })
      })()
      return true
    }

    default: {
      // No-op for unknown message types
      return
    }
  }
})

const createRegistrationCredential = async (options, requestOrigin) => {
  try {
    const { rp, challenge: challengeB64Url } = options
    const rpId = rp.id

    // Reconstruct clientDataJSON
    const clientDataJSON = CredentialGenerator.rebuildClientDataJSON(
      challengeB64Url,
      requestOrigin,
      'webauthn.create'
    )

    // Generate keypair + credentialId
    const keyPair = await CredentialGenerator.generateKeyPair()
    const credentialId = CredentialGenerator.uuidv4()
    const credentialIdBytes = CredentialGenerator.uuidToBytes(credentialId)
    const credentialIdB64 = arrayBufferToBase64Url(credentialIdBytes.buffer)

    // Generate authenticator data
    const authData = await CredentialGenerator.buildAuthenticatorData(
      rpId,
      credentialIdBytes,
      keyPair.publicKey
    )

    // Create attestationObjectBuffer
    const attestationObjectBuffer =
      CredentialGenerator.encodeAttestationObject(authData)

    // Build the final credential response
    const response = {
      clientDataJSON: arrayBufferToBase64Url(clientDataJSON),
      attestationObject: arrayBufferToBase64Url(attestationObjectBuffer),
      authenticatorData: arrayBufferToBase64Url(authData.buffer),
      publicKey: await CredentialGenerator.exportPublicKeyAsPem(
        keyPair.publicKey
      ),
      publicKeyAlgorithm: -7,
      transports: ['internal']
    }

    // Export private key as raw binary PKCS#8 buffer and encode as Base64URL
    const privateKeyBuffer = await crypto.subtle.exportKey(
      'pkcs8',
      keyPair.privateKey
    )
    const privateKeyBufferB64 = arrayBufferToBase64Url(privateKeyBuffer)
    // Save user ID buffer as Base64URL string
    const userIdBase64 = options.user.id

    return {
      id: credentialIdB64,
      rawId: credentialIdB64,
      type: 'public-key',
      response,
      authenticatorAttachment:
        options.authenticatorSelection?.authenticatorAttachment || 'platform',
      clientExtensionResults: {
        credProps: {
          rk: options.authenticatorSelection?.residentKey === 'required'
        }
      },
      _privateKeyBuffer: privateKeyBufferB64,
      _userId: userIdBase64
    }
  } catch (error) {
    throw new Error(`Could not create credential from public key: ${error}`)
  }
}

const sendPasskeyPayload = async (
  requestOrigin,
  serializedPublicKey,
  sendResponse
) => {
  try {
    const publicKey = JSON.parse(serializedPublicKey)
    const credential = await createRegistrationCredential(
      publicKey,
      requestOrigin
    )

    sendResponse({
      success: true,
      credential,
      publicKey
    })
  } catch (error) {
    logger.error('Failed to create passkey payload:', error)
    sendResponse({
      success: false,
      error: error?.message || 'Failed to create passkey'
    })
  }
}

const handleLoginMessage = ({ msg, sender }) => {
  if (!msg.data.username && msg.data.password) {
    pending.set(sender.tab.id, {
      ...pending.get(sender.tab.id),
      password: msg.data.password
    })
  } else {
    pending.set(sender.tab.id, msg.data)
  }

  setTimeout(() => {
    clearPending(sender.tab.id)
  }, 1000 * 30)
}

const handleGetPendingLogin = ({ msg, sender, sendResponse }) => {
  if (!pending.has(sender.tab.id) && !msg.data) {
    sendResponse({ type: 'pendingLogin', data: null })
    return
  }

  const data = pending.get(sender.tab.id) || null

  sendResponse({ type: 'pendingLogin', data: data })
  clearPending(sender.tab.id)
}

const clearPending = (tabId) => {
  if (pending.has(tabId)) {
    pending.delete(tabId)
  }
}

const openPasskeyWindow = (queryParams = new URLSearchParams()) => {
  // Get the page type from queryParams to determine the route
  const page = queryParams.get('page')

  chrome.windows.create({
    focused: true,
    height: passkeyWindowSize.height,
    width: passkeyWindowSize.width,
    url: runtime.getURL(`index.html#/${page}?${queryParams.toString()}`),
    type: 'popup'
  })
}

const handlePasskeyCreated = ({ msg }) => {
  const { requestId, selectedItem, tabId } = msg

  chrome.tabs.sendMessage(parseInt(tabId), {
    type: 'selectedPasskey',
    requestId,
    selectedItem
  })
}

const getAssertionCredential = async (
  requestOrigin,
  serializedPublicKey,
  savedCredential
) => {
  const publicKey = JSON.parse(serializedPublicKey)
  const { challenge: challengeB64, rpId, userVerification } = publicKey

  // Rebuild the clientDataJSON for "webauthn.get"
  const clientDataJSON = CredentialGenerator.rebuildClientDataJSON(
    challengeB64,
    requestOrigin,
    'webauthn.get'
  )

  // Build the authenticator data blob for assertion (simple 37-byte format)
  const authData = await CredentialGenerator.buildAuthenticatorData(
    rpId,
    null,
    null,
    true,
    userVerification || 'preferred'
  )

  // Sign the assertion over authenticatorData and clientDataJSON
  // Decode the binary buffer private key and import it
  const privateKeyBuffer = base64UrlToArrayBuffer(
    savedCredential._privateKeyBuffer
  )
  const privateKeyFromBuffer = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: CRYPTO_ALGORITHMS.ECDSA,
      namedCurve: ELLIPTIC_CURVES.P_256
    },
    false,
    ['sign']
  )

  const signature = await CredentialGenerator.signAssertion(
    privateKeyFromBuffer,
    authData.buffer,
    clientDataJSON
  )

  // Build the final credential response
  const response = {
    clientDataJSON: arrayBufferToBase64Url(clientDataJSON),
    attestationObject: savedCredential.response.attestationObject,
    authenticatorData: arrayBufferToBase64Url(authData.buffer),
    signature: arrayBufferToBase64Url(signature),
    userHandle: savedCredential._userId
  }

  return {
    id: savedCredential.id,
    rawId: savedCredential.rawId,
    type: 'public-key',
    response,
    // Match the authenticatorAttachment & transports with the saved credential
    authenticatorAttachment: savedCredential.authenticatorAttachment,
    clientExtensionResults: savedCredential.clientExtensionResults
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (conditionalPasskeyRequests.has(tabId)) {
    conditionalPasskeyRequests.delete(tabId)
    logger.log(`Cleaned up conditional passkey request for closed tab ${tabId}`)
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && conditionalPasskeyRequests.has(tabId)) {
    conditionalPasskeyRequests.delete(tabId)
    logger.log(
      `Cleaned up conditional passkey request for tab ${tabId} navigation`
    )
  }
})
