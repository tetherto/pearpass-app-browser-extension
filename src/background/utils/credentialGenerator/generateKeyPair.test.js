Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn()
    }
  }
})

import { generateKeyPair } from './generateKeyPair'
import { CRYPTO_ALGORITHMS } from '../../../shared/constants/crypto'
import { ELLIPTIC_CURVES } from '../../../shared/constants/crypto'

describe('generateKeyPair', () => {
  const mockKeyPair = {
    publicKey: 'mockPublicKey',
    privateKey: 'mockPrivateKey'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    global.crypto.subtle.generateKey = jest.fn().mockResolvedValue(mockKeyPair)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call crypto.subtle.generateKey with correct parameters', async () => {
    await generateKeyPair()
    expect(crypto.subtle.generateKey).toHaveBeenCalledWith(
      {
        name: CRYPTO_ALGORITHMS.ECDSA,
        namedCurve: ELLIPTIC_CURVES.P_256
      },
      true,
      ['sign', 'verify']
    )
  })

  it('should return the generated key pair on success', async () => {
    const keyPair = await generateKeyPair()
    expect(keyPair).toEqual(mockKeyPair)
  })

  it('should throw an error if key generation fails', async () => {
    const error = new Error('Key generation failed')
    crypto.subtle.generateKey.mockRejectedValue(error)
    await expect(generateKeyPair()).rejects.toThrow('Key generation failed')
  })
})
