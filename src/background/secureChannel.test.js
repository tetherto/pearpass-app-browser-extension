/* eslint-env jest */
import { secureChannel, SecureChannelClient } from './secureChannel'

// Mock chrome.storage
const mem = {}

beforeEach(() => {
  // Clear in-memory storage between tests
  for (const k of Object.keys(mem)) delete mem[k]
  // @ts-ignore
  global.chrome = {
    storage: {
      local: {
        get: (keys, cb) => {
          const res = {}
          for (const k of keys) res[k] = mem[k]
          cb(res)
        },
        set: (obj, cb) => {
          Object.assign(mem, obj)
          cb()
        }
      }
    }
  }
})

// Mock client key store to avoid IndexedDB and master password flow in tests
jest.mock('./clientKeyStore', () => ({
  ensureClientKeypairUnlocked: jest.fn(async () => ({
    publicKey: new Uint8Array([1, 2, 3]),
    privateKey: new Uint8Array([4, 5, 6])
  })),
  ensureClientKeypairGeneratedForPairing: jest.fn(async () => ({
    publicKey: new Uint8Array([1, 2, 3]),
    privateKey: new Uint8Array([4, 5, 6])
  }))
}))

// Mock nativeMessaging
jest.mock('./nativeMessaging', () => ({
  nativeMessaging: {
    sendRequest: jest.fn(async (command) => {
      if (command === 'nmGetAppIdentity') {
        return {
          ed25519PublicKey: 'edpk',
          x25519PublicKey: 'xpk',
          fingerprint: 'ff00aa11'
        }
      }
      throw new Error('NotImplemented')
    })
  }
}))

describe('SecureChannelClient', () => {
  it('fetches identity and stores pin', async () => {
    // Provide required pairing token
    const id = await secureChannel.getAppIdentity('test-pairing-token')
    expect(id.fingerprint).toBe('ff00aa11')

    await secureChannel.pinIdentity(id)
    const pinned = await secureChannel.getPinnedIdentity()
    expect(pinned.fingerprint).toBe('ff00aa11')
    expect(pinned.ed25519PublicKey).toBe('edpk')
    expect(pinned.x25519PublicKey).toBe('xpk')
  })

  it('throws error when getting pairing code', async () => {
    // getPairingCode is deprecated and should throw an error
    await expect(secureChannel.getPairingCode()).rejects.toThrow(
      'MethodDeprecated: For security, pairing codes must be viewed directly in the desktop app'
    )
  })

  it('unpairs correctly', async () => {
    const client = new SecureChannelClient()
    await client.unpair()
    const pinned = await client.getPinnedIdentity()
    expect(pinned).toBeNull()
  })
})
