Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn(() => new Uint8Array(32).buffer),
      sign: jest.fn(() => new ArrayBuffer(64))
    }
  }
})

import { signAssertion } from './signAssertion'
import { CRYPTO_ALGORITHMS } from '../../../shared/constants/crypto'

describe('signAssertion', () => {
  const privateKey = { type: 'private' } // Mock CryptoKey
  const authData = new Uint8Array([1, 2, 3, 4]).buffer
  const clientDataJSON = new Uint8Array([5, 6, 7, 8]).buffer
  const clientDataHash = new Uint8Array(32).buffer
  const signature = new ArrayBuffer(64)

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    crypto.subtle.digest.mockResolvedValue(clientDataHash)
    crypto.subtle.sign.mockResolvedValue(signature)
  })

  it('should hash the clientDataJSON using SHA-256', async () => {
    await signAssertion(privateKey, authData, clientDataJSON)
    expect(crypto.subtle.digest).toHaveBeenCalledWith(
      CRYPTO_ALGORITHMS.SHA_256,
      clientDataJSON
    )
  })

  it('should sign the concatenated authenticator data and client data hash', async () => {
    await signAssertion(privateKey, authData, clientDataJSON)

    const expectedDataToSign = new Uint8Array(
      authData.byteLength + clientDataHash.byteLength
    )
    expectedDataToSign.set(new Uint8Array(authData), 0)
    expectedDataToSign.set(new Uint8Array(clientDataHash), authData.byteLength)

    expect(crypto.subtle.sign).toHaveBeenCalledWith(
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        hash: { name: CRYPTO_ALGORITHMS.SHA_256 }
      },
      privateKey,
      expectedDataToSign.buffer
    )
  })

  it('should return a DER-encoded signature', async () => {
    const result = await signAssertion(privateKey, authData, clientDataJSON)
    expect(result).toBeInstanceOf(ArrayBuffer)
  })

  it('should throw an error if signing fails', async () => {
    const error = new Error('Signing failed')
    crypto.subtle.sign.mockRejectedValue(error)

    await expect(
      signAssertion(privateKey, authData, clientDataJSON)
    ).rejects.toThrow(error)
  })

  it('should throw an error if hashing fails', async () => {
    const error = new Error('Hashing failed')
    crypto.subtle.digest.mockRejectedValue(error)

    await expect(
      signAssertion(privateKey, authData, clientDataJSON)
    ).rejects.toThrow(error)
  })
})
