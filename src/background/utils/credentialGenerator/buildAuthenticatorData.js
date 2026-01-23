import { encodeBytes } from './encodeBytes'
import { encodeUInt } from './encodeUInt'
import { startMap } from './startMap'
import { CRYPTO_ALGORITHMS } from '../../../shared/constants/crypto'

/**
 * Construct authenticatorData for "none" attestation or for assertions.
 * @param {string} rpId Relying party ID
 * @param {ArrayBuffer} credentialId Credential identifier (only needed for attestation)
 * @param {CryptoKey} publicKey ECDSA P-256 public key (only needed for attestation)
 * @param {boolean} isAssertion Whether this is for assertion (auth) vs attestation (registration)
 * @param {string} userVerification 'discouraged', 'preferred', or 'required' (only for assertions)
 * @returns {Promise<Uint8Array>} Authenticator data bytes
 */
export const buildAuthenticatorData = async (
  rpId,
  credentialId,
  publicKey,
  isAssertion = false,
  userVerification = 'preferred'
) => {
  // 1) rpIdHash = SHA256(rpId)
  const rpIdUtf8 = new TextEncoder().encode(rpId)

  const rpIdHashBuf = await crypto.subtle.digest(
    CRYPTO_ALGORITHMS.SHA_256,
    rpIdUtf8
  )
  const rpIdHash = new Uint8Array(rpIdHashBuf) // 32 bytes

  // 2) flags:
  let flags
  if (isAssertion) {
    // For assertions:
    //    bit 0: User Present (UP) = 1 (always)
    //    bit 2: User Verified (UV) = depends on userVerification
    //    bit 3: Backup eligibility = 1
    //    bit 4: Backup state = 1
    //    bit 6: AT (attested credential included) = 0 (NOT set for assertions!)
    //    bit 7: ED (extension data) = 0

    let flagByte = 0x01 // UP bit (always set)
    flagByte |= 0x18 // BE + BS bits (0x08 + 0x10)

    // Set UV bit based on userVerification parameter
    // For 'required' or 'preferred': set UV=1 (master password counts as verification)
    // For 'discouraged': leave UV=0
    if (userVerification === 'required' || userVerification === 'preferred') {
      flagByte |= 0x04 // Set UV bit
    }

    flags = new Uint8Array([flagByte])
  } else {
    // For attestation:
    //    bit 0: User Present (UP) = 1
    //    bit 2: User Verified (UV) = 1
    //    bit 3: Backup eligibility = 1
    //    bit 4: Backup state = 1
    //    bit 6: AT (attested credential included) = 1
    //    bit 7: ED (extension data) = 0
    flags = new Uint8Array([0x5d]) // 0x01 (UP) + 0x04 (UV) + 0x08 (BE) + 0x10 (BS) + 0x40 (AT) = 0x5d
  }

  // 3) signCount: 4 bytes, big‐endian
  const signCount = new Uint8Array([0x00, 0x00, 0x00, 0x00])

  // For assertions, we only need rpIdHash + flags + signCount (37 bytes)
  if (isAssertion) {
    const authData = new Uint8Array(37)
    authData.set(rpIdHash, 0)
    authData.set(flags, 32)
    authData.set(signCount, 33)
    return authData
  }

  // 4) attestedCredentialData (only for attestation):
  //   a) aaguid: 16 bytes. All zeros for a “software/virtual” AAGUID.
  const aaguid = new Uint8Array(16)

  //   b) credIdLen: 2‐byte big‐endian length of credentialId
  const credIdLen = new Uint8Array([
    (credentialId.byteLength >> 8) & 0xff,
    credentialId.byteLength & 0xff
  ])

  //   c) credId: the random ID in Uint8Array we already passed in

  //   d) cosePublicKey: CBOR‐encoded COSE Key for our publicKey
  const rawPubKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', publicKey)
  )
  // rawPubKey[0] is 0x04, next 32 bytes is X, next 32 bytes is Y.
  const xCoord = rawPubKey.slice(1, 33)
  const yCoord = rawPubKey.slice(33, 65)

  // CBOR‐encoded COSE key as a map of 5 elements
  //   header (map of 5 pairs): 0xa5
  //   keys: integers 1, 3, -1, -2, -3
  //   values: integers 2, -7, 1, X, Y
  const coseKey = new Uint8Array([
    ...startMap(5),
    0x01,
    ...encodeUInt(2), // kty=EC2
    0x03,
    0x26, // alg=-7
    0x20,
    ...encodeUInt(1), // crv=P-256
    0x21,
    ...encodeBytes(xCoord),
    0x22,
    ...encodeBytes(yCoord)
  ])

  // Assemble authData:
  //   authData = [
  //     rpIdHash (32),
  //     flags (1),
  //     signCount (4),
  //     aaguid (16),
  //     credIdLen (2),
  //     credId (n bytes),
  //     coseKey (m bytes)
  //   ]
  const parts = [
    rpIdHash,
    flags,
    signCount,
    aaguid,
    credIdLen,
    new Uint8Array(credentialId),
    coseKey
  ]

  const totalLen = parts.reduce((sum, part) => sum + part.byteLength, 0)
  const authData = new Uint8Array(totalLen)
  let offset = 0
  for (const part of parts) {
    authData.set(part, offset)
    offset += part.byteLength
  }

  return authData
}
