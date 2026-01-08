import './nativeMessaging' // Initialize native messaging handler
import { MESSAGES, ALARMS } from './constants'
import { secureChannel } from './secureChannel'
import * as CredentialGenerator from './utils/credentialGenerator'
import { validateSender } from './utils/validateSender'
import { ERROR_CODES } from '../shared/constants/nativeMessaging'
import {
  MESSAGE_TYPES,
  SECURE_MESSAGE_TYPES
} from '../shared/services/messageBridge'
import { arrayBufferToBase64Url } from '../shared/utils/arrayBufferToBase64Url'
import { base64UrlToArrayBuffer } from '../shared/utils/base64UrlToArrayBuffer'
import { logger } from '../shared/utils/logger'

const { SCHEDULE_CLIPBOARD_CLEAR, CLEAR_CLIPBOARD_NOW } = MESSAGES
const { CLEAR_CLIPBOARD } = ALARMS

const pending = new Map()

// Initialize secure session on startup if already paired
chrome.runtime.onStartup?.addListener(async () => {
  try {
    if (await secureChannel.isPaired()) {
      await secureChannel.ensureSession()
    }
  } catch (error) {
    logger.log('Failed to ensure session on startup:', error?.message || error)
  }
})

// Gracefully close session when service worker is suspended
chrome.runtime.onSuspend?.addListener(() => {
  if (secureChannel.hasActiveSession()) {
    void secureChannel.closeSession(secureChannel._session.id)
  }
})

const ensureClipboardOffscreenDocument = async () => {
  try {
    const hasDocument = await chrome.offscreen.hasDocument()
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('offscreen.html'),
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
      chrome.runtime.sendMessage({
        type: CLEAR_CLIPBOARD_NOW
      })
    } catch (error) {
      logger.error('[Clipboard] Failed to handle clipboard clear alarm', error)
    }
  }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
    MESSAGE_TYPES.GET_PASSKEY
  ]

  if (contentScriptTypes.includes(msg.type)) {
    if (!validateSender(sender, 'content-script')) {
      sendResponse({ success: false, error: 'Unauthorized' })
      return
    }
  }

  if (msg.type === MESSAGE_TYPES.LOGIN) {
    handleLoginMessage({ msg, sender })
    return
  }

  if (msg.type === MESSAGE_TYPES.GET_PENDING_LOGIN) {
    handleGetPendingLogin({ msg, sender, sendResponse })
    return
  }

  if (msg.type === MESSAGE_TYPES.CREATE_PASSKEY) {
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

  if (msg.type === MESSAGE_TYPES.GET_PASSKEY) {
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

  if (msg.type === MESSAGE_TYPES.SELECTED_PASSKEY) {
    handlePasskeyCreated({ msg })
    return
  }

  if (msg.type === MESSAGE_TYPES.READY_FOR_PASSKEY_PAYLOAD) {
    const { requestOrigin, serializedPublicKey } = msg
    void sendPasskeyPayload(requestOrigin, serializedPublicKey, sendResponse)

    return true
  }

  if (msg.type === MESSAGE_TYPES.GET_ASSERTION_CREDENTIAL) {
    const {
      requestOrigin,
      serializedPublicKey,
      credential: savedCredential
    } = msg
    void getAssertionCredential(
      requestOrigin,
      serializedPublicKey,
      savedCredential
    ).then((assertionCredential) => {
      sendResponse({
        type: 'assertionCredential',
        assertionCredential
      })
    })

    return true
  }

  if (msg.type === MESSAGE_TYPES.GET_IDENTITY) {
    ;(async () => {
      try {
        const { pairingToken } = msg
        if (!pairingToken) {
          sendResponse({
            success: false,
            error: 'PairingTokenRequired',
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

  if (msg.type === MESSAGE_TYPES.CONFIRM_PAIR) {
    ;(async () => {
      try {
        await secureChannel.pinIdentity(msg.identity)
        const handshake = await secureChannel.beginHandshake()
        if (!handshake.ok) {
          sendResponse({
            ok: false,
            error: handshake.error || 'HandshakeFailed',
            code: ERROR_CODES.HANDSHAKE_FAILED
          })
          return
        }
        const finish = await secureChannel.finishHandshake()
        if (!finish?.ok) {
          sendResponse({
            ok: false,
            error: finish?.error || 'HandshakeFinishFailed',
            code: ERROR_CODES.HANDSHAKE_FAILED
          })
          return
        }
        sendResponse({ ok: true, sessionId: handshake.sessionId })
      } catch (e) {
        sendResponse({
          ok: false,
          error: e?.message,
          code: ERROR_CODES.UNKNOWN
        })
      }
    })()
    return true
  }

  if (msg.type === MESSAGE_TYPES.CHECK_PAIRED) {
    ;(async () => {
      try {
        const paired = await secureChannel.isPaired()
        sendResponse({ paired })
      } catch (e) {
        sendResponse({
          paired: false,
          error: e?.message,
          code: ERROR_CODES.UNKNOWN
        })
      }
    })()
    return true
  }

  if (msg.type === MESSAGE_TYPES.GET_PLATFORM_INFO) {
    chrome.runtime.getPlatformInfo((info) => {
      sendResponse(info)
    })
    return true
  }

  if (msg.type === SCHEDULE_CLIPBOARD_CLEAR) {
    ;(async () => {
      await chrome.alarms.clear(CLEAR_CLIPBOARD)
      const when = Date.now() + msg.delayMs
      await chrome.alarms.create(CLEAR_CLIPBOARD, { when })
      sendResponse({ ok: true })
    })()
    return true
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
  const publicKey = JSON.parse(serializedPublicKey)
  const credential = await createRegistrationCredential(
    publicKey,
    requestOrigin
  )

  sendResponse({
    type: 'passkeyPayload',
    credential,
    publicKey
  })
}

const handleLoginMessage = ({ msg, sender }) => {
  if (!msg.data.username && msg.data.password) {
    pending.set(sender.tab.id, {
      ...pending.get(sender.tab.id),
      password: msg.data.password
    })
  }

  pending.set(sender.tab.id, msg.data)

  setTimeout(() => {
    clearPending(msg.tabId)
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
    height: 600,
    width: 400,
    url: chrome.runtime.getURL(`index.html#/${page}?${queryParams.toString()}`),
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
  const { challenge: challengeB64, rpId } = publicKey

  // Rebuild the clientDataJSON for "webauthn.get"
  const clientDataJSON = CredentialGenerator.rebuildClientDataJSON(
    challengeB64,
    requestOrigin,
    'webauthn.get'
  )

  // Decode the credential ID back into bytes
  const credIdBytes = base64UrlToArrayBuffer(savedCredential.rawId)

  // Build the authenticator data blob
  const authData = await CredentialGenerator.buildAuthenticatorData(
    rpId,
    credIdBytes,
    await CredentialGenerator.importPublicKeyFromPem(
      savedCredential.response.publicKey
    )
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
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false, // non-extractable for extra safety
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
