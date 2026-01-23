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

  // Sign with ECDSA‑P256 / SHA‑256 (returns raw signature: r || s, 64 bytes)
  const rawSignature = await crypto.subtle.sign(
    {
      name: CRYPTO_ALGORITHMS.ECDSA,
      hash: { name: CRYPTO_ALGORITHMS.SHA_256 }
    },
    privateKey,
    dataToSign.buffer
  )

  // Convert raw signature (r || s) to DER format
  // WebAuthn requires DER-encoded signatures
  return rawToDer(new Uint8Array(rawSignature))
}

/**
 * Convert raw ECDSA signature (r || s) to DER format
 * @param {Uint8Array} raw - 64-byte raw signature (32 bytes r + 32 bytes s)
 * @returns {ArrayBuffer} DER-encoded signature
 */
function rawToDer(raw) {
  const r = raw.slice(0, 32)
  const s = raw.slice(32, 64)

  // Encode r and s as DER integers
  const rDer = encodeInteger(r)
  const sDer = encodeInteger(s)

  // Build SEQUENCE: 0x30 [length] [rDer] [sDer]
  const derLength = rDer.length + sDer.length
  const der = new Uint8Array(2 + derLength)
  der[0] = 0x30
  der[1] = derLength
  der.set(rDer, 2)
  der.set(sDer, 2 + rDer.length)

  return der.buffer
}

/**
 * Encode a positive integer as DER INTEGER
 * @param {Uint8Array} bytes - Integer bytes (big-endian)
 * @returns {Uint8Array} DER-encoded integer
 */
function encodeInteger(bytes) {
  // Remove leading zeros but keep at least one byte
  let start = 0
  while (start < bytes.length - 1 && bytes[start] === 0) {
    start++
  }
  const trimmed = bytes.slice(start)

  // Add leading zero if high bit is set (to make it positive)
  const needsPadding = trimmed[0] & 0x80
  const length = trimmed.length + (needsPadding ? 1 : 0)

  const result = new Uint8Array(2 + length)
  result[0] = 0x02
  result[1] = length
  if (needsPadding) {
    result[2] = 0x00
    result.set(trimmed, 3)
  } else {
    result.set(trimmed, 2)
  }

  return result
}
