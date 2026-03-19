import { setPearpassVaultClient } from '@tetherto/pearpass-lib-vault'

import { createClient } from './client'
import { PearpassVaultClient } from '../vaultClient'

jest.mock('../vaultClient')
jest.mock('@tetherto/pearpass-lib-vault', () => ({
  setPearpassVaultClient: jest.fn()
}))
jest.mock('./constants/envMode', () => ({
  MODE: 'test'
}))

describe('client module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  describe('createClient()', () => {
    it('should create a new client when not initialized', async () => {
      const fakeClient = { foo: 'bar' }
      PearpassVaultClient.mockImplementation(() => fakeClient)

      const client = await createClient()

      expect(PearpassVaultClient).toHaveBeenCalledWith({
        debugMode: false
      })
      expect(setPearpassVaultClient).toHaveBeenCalledWith(fakeClient)
      expect(client).toBe(fakeClient)
    })

    it('should return existing client on subsequent calls', async () => {
      jest.resetModules()

      const { createClient } = require('./client')
      const { PearpassVaultClient } = require('../vaultClient')

      const fakeClient = { reuse: true }
      PearpassVaultClient.mockImplementation(() => fakeClient)

      const first = await createClient()
      expect(first).toBe(fakeClient)

      jest.clearAllMocks()

      const second = await createClient()
      expect(second).toBe(first)

      expect(PearpassVaultClient).not.toHaveBeenCalled()
      expect(setPearpassVaultClient).not.toHaveBeenCalled()
    })
  })

  describe('getClient()', () => {
    it('returns the initialized client', async () => {
      jest.resetModules()

      const { createClient, getClient } = require('./client')
      const { PearpassVaultClient } = require('../vaultClient')

      const fakeClient = { ready: true }
      PearpassVaultClient.mockImplementation(() => fakeClient)

      const init = await createClient()
      expect(init).toBe(fakeClient)

      const got = getClient()
      expect(got).toBe(fakeClient)
    })

    it('throws if not initialized', () => {
      jest.resetModules()

      const { getClient } = require('./client')

      expect(() => getClient()).toThrow(
        'Pearpass Vault client is not initialized. Call createClient() first.'
      )
    })
  })
})
