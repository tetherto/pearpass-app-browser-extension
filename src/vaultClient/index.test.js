import { PearpassVaultClient } from './index'
import { runtime } from '../shared/utils/runtime'

jest.mock('../shared/utils/runtime', () => ({
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    lastError: null
  }
}))

// Mock command definitions
jest.mock('../shared/commandDefinitions', () => ({
  COMMAND_NAMES: ['vaultsInit', 'vaultsClose', 'checkAvailability'],
  getCommandParams: jest.fn((commandName, args) => {
    switch (commandName) {
      case 'vaultsInit':
        return { encryptionKey: args[0] }
      default:
        return {}
    }
  })
}))

const createMockClient = () =>
  new PearpassVaultClient({
    debugMode: true
  })

describe('PearpassVaultClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create a client with default options', () => {
      const client = new PearpassVaultClient()
      expect(client.debugMode).toBe(false)
      expect(client.connected).toBe(false)
    })

    it('should create a client with debug mode enabled', () => {
      const client = new PearpassVaultClient({ debugMode: true })
      expect(client.debugMode).toBe(true)
    })

    it('should create a client with environment-based debug mode', () => {
      const client = new PearpassVaultClient({
        debugMode: true
      })
      expect(client.debugMode).toBe(true)

      const prodClient = new PearpassVaultClient({
        debugMode: false
      })
      expect(prodClient.debugMode).toBe(false)
    })
  })

  describe('connect', () => {
    it('should connect to native host', async () => {
      const client = createMockClient()
      runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ success: true })
      })

      await client.connect()
      expect(client.connected).toBe(true)
    })

    it('should not connect twice', async () => {
      const client = createMockClient()
      client.connected = true

      await client.connect()
      expect(runtime.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('should disconnect from native host', () => {
      const client = createMockClient()
      client.connected = true

      client.disconnect()
      expect(client.connected).toBe(false)
    })
  })
})
