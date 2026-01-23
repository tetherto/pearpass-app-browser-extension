const mockImportKey = {
  publicKey: 'mockPublicKey',
  privateKey: 'mockPrivateKey'
}

Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: {
      importKey: jest.fn(() => Promise.resolve(mockImportKey))
    }
  }
})

import { importPublicKeyFromPem } from './importPublicKeyFromPem'
import {
  CRYPTO_ALGORITHMS,
  ELLIPTIC_CURVES
} from '../../../shared/constants/crypto'
import { base64UrlToArrayBuffer } from '../../../shared/utils/base64UrlToArrayBuffer'

jest.mock('../../../shared/utils/base64UrlToArrayBuffer', () => ({
  base64UrlToArrayBuffer: jest.fn()
}))

describe('importPublicKeyFromPem', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.crypto.subtle.importKey.mockResolvedValue(mockImportKey)
  })

  it('should import a PEM public key successfully', async () => {
    const pemPublicKey = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...'
    const mockArrayBuffer = new ArrayBuffer(8)
    base64UrlToArrayBuffer.mockReturnValue(mockArrayBuffer)

    const result = await importPublicKeyFromPem(pemPublicKey)

    expect(base64UrlToArrayBuffer).toHaveBeenCalledWith(pemPublicKey)
    expect(global.crypto.subtle.importKey).toHaveBeenCalledWith(
      'spki',
      mockArrayBuffer,
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        namedCurve: ELLIPTIC_CURVES.P_256
      },
      true,
      ['verify']
    )
    expect(result).toBe(mockImportKey)
  })

  it('should throw an error if importKey fails', async () => {
    const pemPublicKey = 'invalid-key'
    const mockArrayBuffer = new ArrayBuffer(8)
    const importError = new Error('Import failed')
    base64UrlToArrayBuffer.mockReturnValue(mockArrayBuffer)
    global.crypto.subtle.importKey.mockRejectedValueOnce(importError)

    await expect(importPublicKeyFromPem(pemPublicKey)).rejects.toThrow(
      importError
    )

    expect(base64UrlToArrayBuffer).toHaveBeenCalledWith(pemPublicKey)
    expect(global.crypto.subtle.importKey).toHaveBeenCalledWith(
      'spki',
      mockArrayBuffer,
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        namedCurve: ELLIPTIC_CURVES.P_256
      },
      true,
      ['verify']
    )
  })
})
