// Polyfill TextEncoder/TextDecoder for Node.js test environment
import { TextEncoder, TextDecoder } from 'util'

import { i18n } from '@lingui/core'

import { CRYPTO_ALGORITHMS } from './src/shared/constants/crypto'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Activate a default locale so lingui's ICU runtime (plural rules, etc.)
// has a valid Intl.PluralRules locale to resolve against in tests.
i18n.load('en', {})
i18n.activate('en')

// Mock @lingui/core/macro for tests. Templates tagged with `t` are still
// processed by the macro plugin, but any leftover direct calls fall back
// to identity.
jest.mock('@lingui/core/macro', () => ({
  t: (str) => str,
  plural: (count, forms) => {
    const form = count === 1 ? forms.one : forms.other
    return String(form ?? '').replace(/#/g, String(count))
  }
}))

// Mock @lingui/react for tests
jest.mock('@lingui/react', () => ({
  Trans: ({ children, id, message }) => children || message || id
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

// jsdom doesn't implement ResizeObserver; provide a no-op so hooks that use it can mount.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Mock chrome for tests
if (typeof global.chrome === 'undefined') {
  const makeStorageArea = () => {
    const data = new Map()
    return {
      get: jest.fn(async (key) => {
        if (typeof key === 'string') {
          return data.has(key) ? { [key]: data.get(key) } : {}
        }
        return {}
      }),
      set: jest.fn(async (items) => {
        for (const [k, v] of Object.entries(items)) data.set(k, v)
      }),
      remove: jest.fn(async (key) => {
        data.delete(key)
      })
    }
  }
  global.chrome = {
    runtime: {
      onMessage: {
        addListener: jest.fn()
      },
      sendMessage: jest.fn(),
      connect: jest.fn(),
      lastError: null
    },
    storage: {
      session: makeStorageArea(),
      local: makeStorageArea()
    }
  }
}
