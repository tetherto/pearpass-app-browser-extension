import { ed25519 } from '@noble/curves/ed25519'

import { AUTH_ERROR_PATTERNS } from '../shared/constants/auth'
import { CRYPTO_ALGORITHMS } from '../shared/constants/crypto'
import { base64Encode, base64Decode } from '../shared/utils/base64'
import { logger } from '../shared/utils/logger'

const DB_NAME = 'pearpassClientKeyStore'
const DB_VERSION = 1
const STORE_NAME = 'clientKeys'
const KEY_ID = 'client-ed25519'

let inMemoryKeypair = null
let pendingKeypair = null
let unlocking = false

const textEncoder = new TextEncoder()

const openDb = () =>
  new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    } catch (error) {
      reject(error)
    }
  })

const getKeyRecord = (db) =>
  new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(KEY_ID)

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => {
        reject(request.error)
      }
    } catch (error) {
      reject(error)
    }
  })

const putKeyRecord = (db, record) =>
  new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(record)

      request.onsuccess = () => {
        resolve()
      }
      request.onerror = () => {
        reject(request.error)
      }
    } catch (error) {
      reject(error)
    }
  })

const getKeyMaterial = async (password) => {
  const encoded = textEncoder.encode(password)
  return crypto.subtle.importKey(
    'raw',
    encoded,
    CRYPTO_ALGORITHMS.PBKDF2,
    false,
    ['deriveKey']
  )
}

const deriveKey = async (password, salt) => {
  const keyMaterial = await getKeyMaterial(password)
  return crypto.subtle.deriveKey(
    {
      name: CRYPTO_ALGORITHMS.PBKDF2,
      salt,
      iterations: 100000,
      hash: CRYPTO_ALGORITHMS.SHA_256
    },
    keyMaterial,
    { name: CRYPTO_ALGORITHMS.AES_GCM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

const encryptPrivateKey = async (privateKeyBytes, password) => {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const nonce = new Uint8Array(12)
  crypto.getRandomValues(nonce)

  const key = await deriveKey(password, salt)
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHMS.AES_GCM, iv: nonce },
    key,
    privateKeyBytes
  )

  return {
    salt,
    nonce,
    ciphertext: new Uint8Array(ciphertextBuffer)
  }
}

const decryptPrivateKey = async (record, password) => {
  const salt = base64Decode(record.saltB64)
  const nonce = base64Decode(record.nonceB64)
  const ciphertext = base64Decode(record.ciphertextB64)

  const key = await deriveKey(password, salt)
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: CRYPTO_ALGORITHMS.AES_GCM, iv: nonce },
    key,
    ciphertext
  )

  return new Uint8Array(plaintextBuffer)
}

/**
 * Ensure a client Ed25519 keypair exists for pairing purposes without requiring
 * the master password. This may generate a new keypair and keep it only in
 * memory (pendingKeypair) until the master password is provided and the key
 * can be encrypted and stored.
 *
 * The private key generated here is never persisted until
 * ensureClientKeypairUnlocked is called with a validated master password.
 *
 * @returns {Promise<{ publicKey: Uint8Array, privateKey: Uint8Array | null }>}
 */
export const ensureClientKeypairGeneratedForPairing = async () => {
  if (inMemoryKeypair) {
    return inMemoryKeypair
  }

  if (pendingKeypair) {
    return pendingKeypair
  }

  // If a stored record exists, we can safely return its public key without
  // decrypting the private key. The private key will only be loaded once the
  // user provides their master password.
  const db = await openDb()
  const record = await getKeyRecord(db)

  if (record?.publicKeyB64) {
    const publicKey = base64Decode(record.publicKeyB64)
    return { publicKey, privateKey: null }
  }

  // No existing record – generate a new keypair and keep it only in memory
  const privateKey = ed25519.utils.randomPrivateKey()
  const publicKey = ed25519.getPublicKey(privateKey)

  pendingKeypair = { publicKey, privateKey }
  return pendingKeypair
}

/**
 * Ensure the client Ed25519 keypair is available in memory and protected at rest
 * with the master password. Private key is stored encrypted in IndexedDB and
 * only decrypted when the user has provided the correct master password.
 *
 * If the keypair is not yet unlocked in memory, a non-empty masterPassword
 * must be provided. The first time this is called in a session, the caller
 * should ensure the password was validated against the vault.
 *
 * @param {string} [masterPassword]
 * @returns {Promise<{ publicKey: Uint8Array, privateKey: Uint8Array }>}
 */
export const ensureClientKeypairUnlocked = async (masterPassword) => {
  if (inMemoryKeypair) {
    return inMemoryKeypair
  }

  if (unlocking) {
    throw new Error('UnlockInProgress')
  }

  if (!masterPassword) {
    throw new Error(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
  }

  unlocking = true
  try {
    return await unlockKeypair(masterPassword)
  } finally {
    unlocking = false
  }
}

const unlockKeypair = async (masterPassword) => {
  const db = await openDb()
  const record = await getKeyRecord(db)

  if (!record) {
    // If we previously generated a pending keypair for pairing, persist that
    // exact keypair so that the desktop's pinned client public key matches the
    // private key we will use for signing.
    let privateKey
    let publicKey

    if (pendingKeypair) {
      ;({ privateKey, publicKey } = pendingKeypair)
    } else {
      // Generate new Ed25519 keypair
      privateKey = ed25519.utils.randomPrivateKey()
      publicKey = ed25519.getPublicKey(privateKey)
    }

    const { salt, nonce, ciphertext } = await encryptPrivateKey(
      privateKey,
      masterPassword
    )

    const newRecord = {
      id: KEY_ID,
      publicKeyB64: base64Encode(publicKey),
      saltB64: base64Encode(salt),
      nonceB64: base64Encode(nonce),
      ciphertextB64: base64Encode(ciphertext),
      createdAt: new Date().toISOString()
    }

    await putKeyRecord(db, newRecord)

    pendingKeypair = null
    inMemoryKeypair = { publicKey, privateKey }
    return inMemoryKeypair
  }

  try {
    const privateKey = await decryptPrivateKey(record, masterPassword)
    const publicKey = base64Decode(record.publicKeyB64)

    inMemoryKeypair = { publicKey, privateKey }
    return inMemoryKeypair
  } catch (error) {
    logger.log('[ClientKeyStore]', 'Failed to decrypt client keypair')
    throw new Error(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_INVALID)
  }
}
