// Secure channel client for Native Messaging pairing and session scaffolding
// Uses nativeMessaging to call desktop IPC methods.
// Uses @noble/curves for Ed25519/X25519 and @noble/ciphers for XSalsa20-Poly1305

import { xsalsa20poly1305 } from '@noble/ciphers/salsa'
import { ed25519, x25519 } from '@noble/curves/ed25519'

import {
  ensureClientKeypairUnlocked,
  ensureClientKeypairGeneratedForPairing,
  hasPersistedClientKeypair,
  clearClientKeypair
} from './clientKeyStore'
import { nativeMessaging } from './nativeMessaging'
import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import { CRYPTO_ALGORITHMS } from '../shared/constants/crypto'
import {
  BACKGROUND_MESSAGE_TYPES,
  SESSION_ERROR_PATTERNS,
  SECURITY_ERROR_PATTERNS,
  PAIRING_ERROR_PATTERNS,
  PROTOCOL_TAGS,
  BLOCKING_STATE
} from '../shared/constants/nativeMessaging'
import { base64Encode, base64Decode } from '../shared/utils/base64'
import { logger } from '../shared/utils/logger'

const concatUint8Arrays = (arrays) => {
  // Concatenate multiple Uint8Arrays without using Buffer.concat
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

// Crypto helper functions

const generateX25519KeyPair = () => {
  const privateKey = x25519.utils.randomPrivateKey()
  const publicKey = x25519.getPublicKey(privateKey)
  return { privateKey, publicKey }
}

const generateNonce = () => {
  const nonce = new Uint8Array(24)
  crypto.getRandomValues(nonce)
  return nonce
}

const verifyEd25519Signature = (message, signature, publicKey) => {
  try {
    return ed25519.verify(signature, message, publicKey)
  } catch (e) {
    logger.error('Ed25519 verification failed:', e)
    return false
  }
}

const secretbox = (plaintext, nonce, key) =>
  xsalsa20poly1305(key, nonce).encrypt(plaintext)

const secretboxOpen = (ciphertext, nonce, key) => {
  try {
    return xsalsa20poly1305(key, nonce).decrypt(ciphertext)
  } catch (error) {
    logger.log('Decryption failed:', error?.message || error)
    return null
  }
}

const STORAGE_KEYS = Object.freeze({
  paired: 'nm.paired',
  fingerprint: 'nm.fingerprint',
  ed25519PublicKey: 'nm.ed25519PublicKey',
  x25519PublicKey: 'nm.x25519PublicKey',
  clientEd25519PublicKey: 'nm.client.ed25519PublicKey'
})

/**
 * read from chrome.storage.local
 * @param {string[]} keys
 * @returns {Promise<Record<string, any>>}
 */
const storageGet = (keys) =>
  new Promise((resolve) =>
    chrome.storage.local.get(keys, (res) => resolve(res))
  )

/**
 * write to chrome.storage.local
 * @param {Record<string, any>} obj
 * @returns {Promise<void>}
 */
const storageSet = (obj) =>
  new Promise((resolve) => chrome.storage.local.set(obj, () => resolve()))

/**
 * Load or generate a long-term client (extension) Ed25519 identity.
 * Public key is sent to desktop during pairing; private key is stored encrypted
 * in IndexedDB and only loaded into memory when unlocked with the master password.
 *
 * @returns {Promise<{ publicKey: Uint8Array, privateKey: Uint8Array }>}
 */
const getOrCreateClientIdentity = async () => ensureClientKeypairUnlocked()

/**
 * Minimal secure channel client.
 */
export class SecureChannelClient {
  /**
   * Check if there's a blocking state requiring user action.
   * Returns null if everything is OK and normal operation should proceed.
   * @returns {Promise<{state: string, error?: string} | null>}
   */
  async getBlockingState() {
    logger.log('[getBlockingState] Starting blocking state check')

    // 1. Check local pairing state
    const pinnedIdentity = await this.getPinnedIdentity()
    const hasIdentity = !!pinnedIdentity
    const hasKeypair = await hasPersistedClientKeypair()

    logger.log('[getBlockingState] Local state:', { hasIdentity, hasKeypair })

    if (!hasIdentity || !hasKeypair) {
      logger.log('[getBlockingState] Missing local state, returning PAIRING')
      return { state: BLOCKING_STATE.PAIRING }
    }

    // 2. Check desktop connection and pairing status
    try {
      // First check if desktop is available
      const availabilityStatus =
        await nativeMessaging.sendRequest('checkAvailability')

      logger.log('[getBlockingState] Availability status:', availabilityStatus)

      if (!availabilityStatus.available) {
        logger.log(
          '[getBlockingState] Desktop not available, returning CONNECTION'
        )
        return {
          state: BLOCKING_STATE.CONNECTION,
          error: availabilityStatus.message
        }
      }

      // Desktop is available, now check pairing status
      const keypairResult = await ensureClientKeypairGeneratedForPairing()
      logger.log('[getBlockingState] Keypair result:', {
        hasPublicKey: !!keypairResult?.publicKey,
        publicKeyLength: keypairResult?.publicKey?.length
      })

      const { publicKey } = keypairResult
      const clientPubB64 = base64Encode(publicKey)

      logger.log(
        '[getBlockingState] Client public key (B64):',
        clientPubB64?.slice(0, 20) + '...',
        'length:',
        clientPubB64?.length
      )

      const pairingStatus = await nativeMessaging.sendRequest(
        'checkExtensionPairingStatus',
        {
          clientEd25519PublicKeyB64: clientPubB64
        }
      )

      logger.log('[getBlockingState] Pairing status:', pairingStatus)

      if (pairingStatus.paired) {
        logger.log('[getBlockingState] Paired, returning null')
        return null
      }

      // Desktop enabled but doesn't recognize this extension
      logger.log(
        '[getBlockingState] Desktop unpaired, clearing session and returning PAIRING'
      )
      await this.clearSession('DesktopNotPaired')
      return { state: BLOCKING_STATE.PAIRING, error: 'Desktop unpaired' }
    } catch (e) {
      // Desktop unreachable or other error
      logger.log('[getBlockingState] Error:', e?.message)
      return { state: BLOCKING_STATE.CONNECTION, error: e?.message }
    }
  }

  /**
   * Check if an identity is pinned (local storage only).
   * @returns {Promise<boolean>}
   */
  async isPaired() {
    const pinned = await this.getPinnedIdentity()
    return !!pinned
  }

  /**
   * Check if a secure session is active.
   * @returns {boolean}
   */
  hasActiveSession() {
    return !!this._session?.id
  }

  /**
   * Ensure a secure session is established when paired.
   * Starts a handshake if needed.
   * Uses a lock to prevent concurrent handshakes from racing.
   * @returns {Promise<void>}
   */
  async ensureSession() {
    if (this.hasActiveSession()) return

    // If a handshake is already in progress, wait for it instead of starting another
    if (this._handshakePromise) {
      return this._handshakePromise
    }

    // Start handshake and store the promise so concurrent callers can wait
    this._handshakePromise = this._performHandshake()
    try {
      return await this._handshakePromise
    } finally {
      this._handshakePromise = undefined
    }
  }

  /**
   * Internal method that performs the actual handshake.
   * Should only be called via ensureSession() to ensure proper locking.
   * @returns {Promise<void>}
   */
  async _performHandshake() {
    if (!(await this.isPaired())) {
      await this.clearSession(SESSION_ERROR_PATTERNS.NOT_PAIRED)
      throw new Error(SESSION_ERROR_PATTERNS.NOT_PAIRED)
    }

    // Check keypair is ready for signing
    try {
      const { privateKey } = await ensureClientKeypairUnlocked()
      if (!privateKey) {
        throw new Error(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
      }
    } catch (e) {
      if (
        e.message &&
        e.message.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
      ) {
        throw e
      }
      // Other keystore errors: proceed to handshake and let it fail naturally
      logger.log('Client keystore check failed, proceeding anyway')
    }

    const handshake = await this.beginHandshake()
    if (!handshake.ok) {
      // If identity keys are unavailable on desktop, trigger pairing flow
      if (
        handshake.error === SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE
      ) {
        await this.clearSession(
          SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE
        )
        throw new Error(
          `${SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE}: Desktop requires pairing reset`
        )
      }
      throw new Error(
        handshake.error || SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED
      )
    }
    const finish = await this.finishHandshake()
    if (!finish?.ok) {
      // If the desktop reports a master-password requirement or a client
      // signature problem, do not clear the pairing; just surface the error
      // so the UI can prompt the user to unlock or reset if needed.
      if (
        finish?.error &&
        (finish.error.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED) ||
          finish.error.includes(
            SECURITY_ERROR_PATTERNS.CLIENT_SIGNATURE_INVALID
          ) ||
          finish.error.includes(SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID))
      ) {
        throw new Error(finish.error)
      }
      // For all other handshake finish failures, clear the session so that
      // the extension can re-establish pairing as needed.
      await this.clearSession(
        finish?.error || SESSION_ERROR_PATTERNS.HANDSHAKE_FINISH_FAILED
      )
      throw new Error(
        finish?.error || SESSION_ERROR_PATTERNS.HANDSHAKE_FINISH_FAILED
      )
    }
  }

  /**
   * Fetch desktop app identity public keys and fingerprint.
   * Requires a pairing token that must be manually copied from the desktop app.
   * @param {string} pairingToken - The pairing token displayed in the desktop app
   * @returns {Promise<{ed25519PublicKey: string, x25519PublicKey: string, fingerprint: string}>}
   */
  async getAppIdentity(pairingToken) {
    if (!pairingToken) {
      throw new Error(
        `${PAIRING_ERROR_PATTERNS.PAIRING_TOKEN_REQUIRED}: Please enter the pairing token from the desktop app`
      )
    }

    // For pairing, generate or reuse a client identity without requiring the
    // master password. The private key will be persisted (encrypted) only after
    // the user unlocks with their master password.
    let clientPublicKeyB64
    try {
      const { publicKey } = await ensureClientKeypairGeneratedForPairing()
      if (publicKey) {
        clientPublicKeyB64 = base64Encode(publicKey)
      }
    } catch {
      logger.log('Failed to prepare client identity for pairing')
      // Proceed without sending client public key; desktop will still pair but
      // will not yet pin a client identity.
    }

    const params = { pairingToken }
    if (clientPublicKeyB64) {
      params.clientEd25519PublicKeyB64 = clientPublicKeyB64
    }

    return nativeMessaging.sendRequest('nmGetAppIdentity', params)
  }

  /**
   * Fetch short pairing code (for user confirmation).
   * @deprecated This method is deprecated for security reasons.
   * @returns {Promise<{pairingCode: string}>}
   */
  async getPairingCode() {
    throw new Error(
      'MethodDeprecated: For security, pairing codes must be viewed directly in the desktop app'
    )
  }

  /**
   * Returns pinned identity if present.
   * @returns {Promise<{fingerprint: string, ed25519PublicKey: string, x25519PublicKey: string} | null>}
   */
  async getPinnedIdentity() {
    const res = await storageGet([
      STORAGE_KEYS.fingerprint,
      STORAGE_KEYS.ed25519PublicKey,
      STORAGE_KEYS.x25519PublicKey,
      STORAGE_KEYS.paired
    ])
    const fingerprint = res[STORAGE_KEYS.fingerprint]
    const ed25519PublicKey = res[STORAGE_KEYS.ed25519PublicKey]
    const x25519PublicKey = res[STORAGE_KEYS.x25519PublicKey]

    // All three fields are required for a valid identity
    if (!fingerprint || !ed25519PublicKey || !x25519PublicKey) {
      logger.log('[getPinnedIdentity] Incomplete identity in storage')
      return null
    }

    logger.log('[getPinnedIdentity] Found identity')
    return { fingerprint, ed25519PublicKey, x25519PublicKey }
  }

  /**
   * Store pinned identity after user verification (pairing).
   * @param {{fingerprint: string, ed25519PublicKey: string, x25519PublicKey: string}} id
   * @returns {Promise<void>}
   */
  async pinIdentity(id) {
    await storageSet({
      [STORAGE_KEYS.fingerprint]: id.fingerprint,
      [STORAGE_KEYS.ed25519PublicKey]: id.ed25519PublicKey,
      [STORAGE_KEYS.x25519PublicKey]: id.x25519PublicKey,
      [STORAGE_KEYS.paired]: true
    })
  }

  /**
   * Remove pinned identity.
   * @returns {Promise<void>}
   */
  async unpair() {
    await storageSet({
      [STORAGE_KEYS.fingerprint]: undefined,
      [STORAGE_KEYS.ed25519PublicKey]: undefined,
      [STORAGE_KEYS.x25519PublicKey]: undefined,
      [STORAGE_KEYS.paired]: false
    })
  }

  /**
   * Clear session and pairing data on security failures.
   * @param {string} reason
   * @returns {Promise<void>}
   */
  async clearSession(reason = SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID) {
    this._session = undefined
    this._ephemeralKeyPair = undefined

    await this.unpair()
    await clearClientKeypair()

    chrome.runtime
      .sendMessage({
        type: BACKGROUND_MESSAGE_TYPES.PAIRING_REQUIRED,
        reason
      })
      .catch(() => {})
  }

  /**
   * Begin authenticated key exchange with the desktop.
   * @returns {Promise<{ok: boolean, error?: string, sessionId?: string}>}
   */
  async beginHandshake() {
    try {
      // Generate ephemeral keypair (X25519-compatible)
      const extensionEphemeralKeyPair = generateX25519KeyPair()
      const extensionEphemeralPublicKeyB64 = base64Encode(
        extensionEphemeralKeyPair.publicKey
      )

      // Hold ephemeral in instance for finish
      this._ephemeralKeyPair = extensionEphemeralKeyPair

      // Request host handshake
      const handshakeResponse = await nativeMessaging.sendRequest(
        'nmBeginHandshake',
        {
          extEphemeralPubB64: extensionEphemeralPublicKeyB64
        }
      )

      // Load pinned identity to verify signature
      const pinnedIdentity = await this.getPinnedIdentity()
      if (!pinnedIdentity) {
        // Trigger pairing modal when not paired
        await this.clearSession(SESSION_ERROR_PATTERNS.NOT_PAIRED)
        return { ok: false, error: SESSION_ERROR_PATTERNS.NOT_PAIRED }
      }

      const hostEphemeralPublicKeyBytes = base64Decode(
        handshakeResponse.hostEphemeralPubB64
      )

      // Load client identity to include in transcript
      const clientIdentity = await getOrCreateClientIdentity()

      // Verify signature over transcript = host_eph_pk || ext_eph_pk || client_ed25519_pk
      // Binds the handshake to the specific extension identity that was registered during pairing
      // by including the client public key
      const transcript = concatUint8Arrays([
        hostEphemeralPublicKeyBytes,
        extensionEphemeralKeyPair.publicKey,
        clientIdentity.publicKey
      ])

      const desktopEd25519PublicKey = base64Decode(
        pinnedIdentity.ed25519PublicKey
      )
      const handshakeSignature = base64Decode(handshakeResponse.signatureB64)

      // Verify Ed25519 signature
      const signatureValid = verifyEd25519Signature(
        transcript,
        handshakeSignature,
        desktopEd25519PublicKey
      )
      if (!signatureValid) {
        // Do NOT clear pairing here – a temporary mismatch or desktop key
        // rotation should not immediately force re-pairing. Surface the
        // error and let higher layers decide if/when to reset pairing.
        return { ok: false, error: SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID }
      }

      // Derive shared secret using X25519
      const sharedSecret = x25519.getSharedSecret(
        extensionEphemeralKeyPair.privateKey,
        hostEphemeralPublicKeyBytes
      )

      // Derive session key via SHA-256(shared||transcript)
      const preimage = concatUint8Arrays([sharedSecret, transcript])
      const digest = await crypto.subtle.digest(
        CRYPTO_ALGORITHMS.SHA_256,
        preimage
      )
      const sessionSymmetricKey = new Uint8Array(digest).slice(0, 32) // Use first 32 bytes for AES-256

      // Stash session info in-memory (no expiration policy)
      this._session = {
        id: handshakeResponse.sessionId,
        key: sessionSymmetricKey,
        seq: 0,
        hostEphemeralPubB64: handshakeResponse.hostEphemeralPubB64
      }

      return { ok: true, sessionId: handshakeResponse.sessionId }
    } catch (error) {
      // If the desktop throws IdentityKeysUnavailable, pass it through
      if (
        error?.message?.includes(
          SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE
        )
      ) {
        return {
          ok: false,
          error: SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE
        }
      }
      // Other errors
      return {
        ok: false,
        error: error?.message || SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED
      }
    }
  }

  /**
   * Finish AKE.
   * @returns {Promise<{ok: boolean, error?: string, sessionId?: string}>}
   */
  async finishHandshake() {
    try {
      if (!this._session?.id) throw new Error(SESSION_ERROR_PATTERNS.NO_SESSION)

      // Reconstruct transcript used by desktop to derive session key
      if (!this._session.hostEphemeralPubB64 || !this._ephemeralKeyPair) {
        throw new Error(SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED)
      }

      const hostEphemeralPublicKeyBytes = base64Decode(
        this._session.hostEphemeralPubB64
      )
      if (
        !(hostEphemeralPublicKeyBytes instanceof Uint8Array) ||
        hostEphemeralPublicKeyBytes.length !== 32
      ) {
        throw new Error(SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED)
      }

      // Load client identity and sign transcript
      const clientIdentity = await getOrCreateClientIdentity()

      // Protocol tag for domain separation (prevents cross-protocol attacks)
      const protocolTag = new TextEncoder().encode(PROTOCOL_TAGS.CLIENT_FINISH)
      // Session ID binding (prevents signature replay across sessions)
      const sessionIdBytes = new TextEncoder().encode(String(this._session.id))

      // Client transcript includes protocol tag + session ID for additional binding
      // Transcript = tag || session_id || host_eph_pk || ext_eph_pk || client_ed25519_pk
      const transcript = concatUint8Arrays([
        protocolTag,
        sessionIdBytes,
        hostEphemeralPublicKeyBytes,
        this._ephemeralKeyPair.publicKey,
        clientIdentity.publicKey
      ])
      const clientSignature = ed25519.sign(
        transcript,
        clientIdentity.privateKey
      )
      const clientSigB64 = base64Encode(clientSignature)

      const res = await nativeMessaging.sendRequest('nmFinishHandshake', {
        sessionId: this._session.id,
        clientSigB64
      })
      return res
    } catch (e) {
      return {
        ok: false,
        error: e?.message || SESSION_ERROR_PATTERNS.HANDSHAKE_FAILED
      }
    } finally {
      // Clear ephemeral keys from memory
      if (this._ephemeralKeyPair) {
        try {
          if (this._ephemeralKeyPair.privateKey)
            this._ephemeralKeyPair.privateKey.fill(0)
          if (this._ephemeralKeyPair.publicKey)
            this._ephemeralKeyPair.publicKey.fill(0)
        } catch (error) {
          logger.log('Failed to zero ephemeral keys:', error?.message || error)
        }
        this._ephemeralKeyPair = undefined
      }
    }
  }

  /**
   * Secure request using an established session.
   * @param {{ method: string, params: any, timeout: number }} payload
   * @returns {Promise<any>}
   */
  async secureRequest({ method, params, timeout }) {
    if (!this._session) throw new Error(SESSION_ERROR_PATTERNS.NO_SESSION)

    const attempt = async () => {
      // Prepare plaintext JSON
      const seq = ++this._session.seq
      const plaintextString = JSON.stringify({ method, params })
      const plaintext = new TextEncoder().encode(plaintextString)
      const nonce = generateNonce() // 24-byte nonce for XSalsa20
      const ciphertext = secretbox(plaintext, nonce, this._session.key)

      const res = await nativeMessaging.sendRequest(
        'nmSecureRequest',
        {
          sessionId: this._session.id,
          nonceB64: base64Encode(nonce),
          ciphertextB64: base64Encode(ciphertext),
          seq
        },
        timeout
      )

      // Decrypt response
      const responseNonce = base64Decode(res.nonceB64)
      const responseCiphertext = base64Decode(res.ciphertextB64)
      const responsePlaintext = secretboxOpen(
        responseCiphertext,
        responseNonce,
        this._session.key
      )
      if (!responsePlaintext)
        throw new Error(SESSION_ERROR_PATTERNS.DECRYPT_FAILED)
      const decoded = JSON.parse(new TextDecoder().decode(responsePlaintext))
      if (!decoded.ok)
        throw new Error(
          decoded.error || SESSION_ERROR_PATTERNS.SECURE_REQUEST_FAILED
        )
      return decoded.result
    }

    try {
      return await attempt()
    } catch (e) {
      // On decrypt failure or session-related errors, re-handshake once and retry
      if (
        e?.message === SESSION_ERROR_PATTERNS.DECRYPT_FAILED ||
        e?.message === SESSION_ERROR_PATTERNS.SECURE_REQUEST_FAILED ||
        e?.message === SESSION_ERROR_PATTERNS.NO_SESSION ||
        e?.message === SESSION_ERROR_PATTERNS.SESSION_NOT_FOUND ||
        e?.message?.includes(SESSION_ERROR_PATTERNS.SESSION_NOT_FOUND)
      ) {
        // Clear any stale session and re-establish
        this._session = undefined
        try {
          await this.ensureSession()
          return await attempt()
        } catch (retryError) {
          // Only clear pairing for identity-level errors; surface session errors.
          const msg = retryError?.message || e?.message || ''
          if (
            msg.includes(SECURITY_ERROR_PATTERNS.IDENTITY_KEYS_UNAVAILABLE) ||
            msg.includes(SESSION_ERROR_PATTERNS.NOT_PAIRED) ||
            msg.includes(SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID)
          ) {
            await this.clearSession(msg)
          }
          throw retryError
        }
      }
      throw e
    }
  }

  /**
   * Close active session.
   * @param {string} sessionId
   * @returns {Promise<{ok: boolean}>}
   */
  async closeSession(sessionId) {
    try {
      return await nativeMessaging.sendRequest('nmCloseSession', { sessionId })
    } finally {
      // Zeroize session key and clear session
      if (this._session?.key?.fill) {
        try {
          this._session.key.fill(0)
        } catch (error) {
          logger.log('Failed to zero session key:', error?.message || error)
        }
      }
      this._session = undefined
    }
  }
}

export const secureChannel = new SecureChannelClient()
