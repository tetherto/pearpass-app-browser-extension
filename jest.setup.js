// Polyfill TextEncoder/TextDecoder for Node.js test environment
import { TextEncoder, TextDecoder } from 'util'

import { CRYPTO_ALGORITHMS } from './src/shared/constants/crypto'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock @lingui/core/macro for tests
jest.mock('@lingui/core/macro', () => ({
  t: (str) => str
}))

// Mock crypto.getRandomValues for tests
if (!global.crypto) {
  global.crypto = {}
}
if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }
}

// Mock crypto.subtle for tests if needed
if (!global.crypto.subtle) {
  global.crypto.subtle = {
    digest: async (algorithm, data) => {
      // Simple mock implementation for SHA-256
      if (algorithm === CRYPTO_ALGORITHMS.SHA_256) {
        // Return a fake 32-byte hash
        const hash = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
          hash[i] = (data[i % data.length] + i) % 256
        }
        return hash.buffer
      }
      throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }
}

// Mock chrome for tests
if (typeof global.chrome === 'undefined') {
  global.chrome = {
    runtime: {
      onMessage: {
        addListener: jest.fn()
      },
      sendMessage: jest.fn(),
      connect: jest.fn(),
      lastError: null
    }
  }
}
