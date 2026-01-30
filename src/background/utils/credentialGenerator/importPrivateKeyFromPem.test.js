import { importPrivateKeyFromPem } from './importPrivateKeyFromPem'
import {
  CRYPTO_ALGORITHMS,
  ELLIPTIC_CURVES
} from '../../../shared/constants/crypto'
import { base64UrlToArrayBuffer } from '../../../shared/utils/base64UrlToArrayBuffer'

const mockCryptoKey = {
  type: 'private',
  algorithm: { name: CRYPTO_ALGORITHMS.ECDSA }
}
const mockImportKey = jest.fn().mockResolvedValue(mockCryptoKey)
const mockSubtle = {
  importKey: mockImportKey
}
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: mockSubtle
  }
})

jest.mock('../../../shared/utils/base64UrlToArrayBuffer', () => ({
  base64UrlToArrayBuffer: jest.fn()
}))

describe('importPrivateKeyFromPem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should import a PEM private key successfully', async () => {
    const pemPrivateKey =
      'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEVs/o5+uGcfA_G2IW9G1J_aJ_eH_8C_c_w'
    const mockArrayBuffer = new ArrayBuffer(8)
    base64UrlToArrayBuffer.mockReturnValue(mockArrayBuffer)

    const result = await importPrivateKeyFromPem(pemPrivateKey)

    expect(base64UrlToArrayBuffer).toHaveBeenCalledWith(pemPrivateKey)
    expect(mockImportKey).toHaveBeenCalledWith(
      'pkcs8',
      mockArrayBuffer,
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        namedCurve: ELLIPTIC_CURVES.P_256
      },
      false,
      ['sign']
    )
    expect(result).toBe(mockCryptoKey)
  })

  it('should throw an error if importKey fails', async () => {
    const pemPrivateKey = 'invalid-pem-key'
    const mockArrayBuffer = new ArrayBuffer(8)
    base64UrlToArrayBuffer.mockReturnValue(mockArrayBuffer)
    const importError = new Error('Import failed')
    mockImportKey.mockRejectedValue(importError)

    await expect(importPrivateKeyFromPem(pemPrivateKey)).rejects.toThrow(
      importError
    )

    expect(base64UrlToArrayBuffer).toHaveBeenCalledWith(pemPrivateKey)
    expect(mockImportKey).toHaveBeenCalledWith(
      'pkcs8',
      mockArrayBuffer,
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        namedCurve: ELLIPTIC_CURVES.P_256
      },
      false,
      ['sign']
    )
  })
})
