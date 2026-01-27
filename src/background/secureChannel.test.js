/* eslint-env jest */
import { nativeMessaging } from './nativeMessaging'
import { secureChannel, SecureChannelClient } from './secureChannel'
import {
  SESSION_ERROR_PATTERNS,
  SECURITY_ERROR_PATTERNS,
  BACKGROUND_MESSAGE_TYPES
} from '../shared/constants/nativeMessaging'

// In-memory chrome.storage mock
const mem = {}

// Mock client key store to avoid IndexedDB and master password flow in tests
jest.mock('./clientKeyStore', () => ({
  ensureClientKeypairUnlocked: jest.fn(async () => ({
    publicKey: new Uint8Array([1, 2, 3]),
    privateKey: new Uint8Array([4, 5, 6])
  })),
  ensureClientKeypairGeneratedForPairing: jest.fn(async () => ({
    publicKey: new Uint8Array([1, 2, 3]),
    privateKey: new Uint8Array([4, 5, 6])
  })),
  hasPersistedClientKeypair: jest.fn(async () => true),
  clearClientKeypair: jest.fn(async () => {})
}))

// Mock noble ed25519/x25519 so we don't depend on real crypto primitives
jest.mock('@noble/curves/ed25519', () => {
  const ed25519 = {
    verify: jest.fn(() => true),
    sign: jest.fn(() => new Uint8Array([9, 9, 9]))
  }
  const x25519 = {
    utils: {
      randomPrivateKey: jest.fn(() => new Uint8Array(32))
    },
    getPublicKey: jest.fn(() => new Uint8Array(32)),
    getSharedSecret: jest.fn(() => new Uint8Array(32))
  }
  return { ed25519, x25519 }
})

// Mock nativeMessaging with configurable implementation
jest.mock('./nativeMessaging', () => ({
  nativeMessaging: {
    sendRequest: jest.fn()
  }
}))

const mockSendRequest = nativeMessaging.sendRequest

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
    },
    runtime: {
      // Used by clearSession to signal PAIRING_REQUIRED
      sendMessage: jest.fn(() => Promise.resolve())
    }
  }

  // Reset native messaging mock between tests
  mockSendRequest.mockReset()
  mockSendRequest.mockImplementation(async (command) => {
    if (command === 'nmGetAppIdentity') {
      return {
        ed25519PublicKey: 'edpk',
        x25519PublicKey: 'xpk',
        fingerprint: 'ff00aa11'
      }
    }
    throw new Error('NotImplemented')
  })
})
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

  it('beginHandshake triggers pairing required when not paired', async () => {
    const client = new SecureChannelClient()

    // Simulate successful nmBeginHandshake response from desktop
    mockSendRequest.mockImplementation(async (command) => {
      if (command === 'nmBeginHandshake') {
        return {
          hostEphemeralPubB64: Buffer.from('host').toString('base64'),
          signatureB64: Buffer.from('sig').toString('base64'),
          sessionId: 'session-1'
        }
      }
      if (command === 'nmGetAppIdentity') {
        return {
          ed25519PublicKey: 'edpk',
          x25519PublicKey: 'xpk',
          fingerprint: 'ff00aa11'
        }
      }
      throw new Error('NotImplemented')
    })

    const result = await client.beginHandshake()

    // When not paired, beginHandshake should clear the session and report NotPaired
    expect(result).toEqual({
      ok: false,
      error: SESSION_ERROR_PATTERNS.NOT_PAIRED
    })
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: BACKGROUND_MESSAGE_TYPES.PAIRING_REQUIRED,
      reason: SESSION_ERROR_PATTERNS.NOT_PAIRED
    })
  })

  it('beginHandshake returns SignatureInvalid but does not clear pairing', async () => {
    const client = new SecureChannelClient()

    // First, pair by pinning an identity
    await secureChannel.pinIdentity({
      fingerprint: 'ff00aa11',
      ed25519PublicKey: Buffer.from('desktop-edpk').toString('base64'),
      x25519PublicKey: 'xpk'
    })

    // Make ed25519.verify return false to simulate invalid desktop signature
    const { ed25519 } = require('@noble/curves/ed25519')
    ed25519.verify.mockReturnValue(false)

    mockSendRequest.mockImplementation(async (command) => {
      if (command === 'nmBeginHandshake') {
        return {
          hostEphemeralPubB64: Buffer.from('host').toString('base64'),
          signatureB64: Buffer.from('sig').toString('base64'),
          sessionId: 'session-1'
        }
      }
      throw new Error('NotImplemented')
    })

    const result = await client.beginHandshake()

    expect(result).toEqual({
      ok: false,
      error: SECURITY_ERROR_PATTERNS.SIGNATURE_INVALID
    })

    // Pairing should remain intact (no PAIRING_REQUIRED message)
    const pinned = await client.getPinnedIdentity()
    expect(pinned).not.toBeNull()
    expect(global.chrome.runtime.sendMessage).not.toHaveBeenCalled()
  })
})
