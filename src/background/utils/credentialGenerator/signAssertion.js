import { CRYPTO_ALGORITHMS } from '../../../shared/constants/crypto'

/**
 * Sign a WebAuthn assertion with a private key.
 * @param {CryptoKey} privateKey ECDSA P-256 private key
 * @param {ArrayBuffer} authData Authenticator data
 * @param {ArrayBuffer} clientDataJSON Client data JSON
 * @returns {Promise<ArrayBuffer>} DER-encoded ECDSA signature
 * @throws {Error} If signing fails
 */
export const signAssertion = async (privateKey, authData, clientDataJSON) => {
  // SHA-256 hash of clientDataJSON
  const clientDataHash = await crypto.subtle.digest(
    CRYPTO_ALGORITHMS.SHA_256,
    clientDataJSON
  )

  // Concatenate authenticatorData || clientDataHash
  const authBuf = new Uint8Array(authData)
  const hashBuf = new Uint8Array(clientDataHash)
  const dataToSign = new Uint8Array(authBuf.length + hashBuf.length)
  dataToSign.set(authBuf, 0)
  dataToSign.set(hashBuf, authBuf.length)

  // Sign with ECDSA‑P256 / SHA‑256
  return crypto.subtle.sign(
    {
      name: CRYPTO_ALGORITHMS.ECDSA,
      hash: { name: CRYPTO_ALGORITHMS.SHA_256 }
    },
    privateKey,
    dataToSign.buffer
  )
}
