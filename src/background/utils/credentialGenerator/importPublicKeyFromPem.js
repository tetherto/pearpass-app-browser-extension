import {
  CRYPTO_ALGORITHMS,
  ELLIPTIC_CURVES
} from '../../../shared/constants/crypto'
import { base64UrlToArrayBuffer } from '../../../shared/utils/base64UrlToArrayBuffer'

/**
 * Import a PEM-encoded EC public key (SPKI) into WebCrypto.
 * @param {string} pemPublicKey PEM string
 * @returns {Promise<CryptoKey>} ECDSA P-256 public key
 * @throws {Error} If import fails
 */
export const importPublicKeyFromPem = async (pemPublicKey) => {
  const bytesInDerFormat = base64UrlToArrayBuffer(pemPublicKey)
  return crypto.subtle.importKey(
    'spki',
    bytesInDerFormat,
    {
      name: CRYPTO_ALGORITHMS.ECDSA,
      namedCurve: ELLIPTIC_CURVES.P_256
    },
    true,
    ['verify']
  )
}
