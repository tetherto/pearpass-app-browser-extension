import { CRYPTO_ALGORITHMS } from '../../../shared/constants/crypto'
import { ELLIPTIC_CURVES } from '../../../shared/constants/crypto'

/**
 * Generate an ECDSA P-256 key pair.
 * @returns {Promise<CryptoKeyPair>} Key pair for sign/verify
 */
export const generateKeyPair = async () =>
  await crypto.subtle.generateKey(
    { name: CRYPTO_ALGORITHMS.ECDSA, namedCurve: ELLIPTIC_CURVES.P_256 },
    true,
    ['sign', 'verify']
  )
