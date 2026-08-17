import {
  getLastOpenedVaultId,
  setLastOpenedVaultId
} from './lastOpenedVaultStorage'
import { logger } from './logger'
import { LOCAL_STORAGE_KEYS } from '../constants/storage'

const KEY = LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID

describe('lastOpenedVaultStorage', () => {
  afterEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  describe('setLastOpenedVaultId', () => {
    it('stores a provided id', () => {
      setLastOpenedVaultId('vault-123')
      expect(localStorage.getItem(KEY)).toBe('vault-123')
    })

    it('coerces non-string ids to a string', () => {
      setLastOpenedVaultId(42)
      expect(localStorage.getItem(KEY)).toBe('42')
    })

    it('no-ops on falsy ids', () => {
      const setSpy = jest.spyOn(Storage.prototype, 'setItem')
      setLastOpenedVaultId('')
      setLastOpenedVaultId(null)
      setLastOpenedVaultId(undefined)
      setLastOpenedVaultId(0)
      expect(setSpy).not.toHaveBeenCalled()
      expect(localStorage.getItem(KEY)).toBeNull()
    })

    it('swallows and logs errors on write failure', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })

      expect(() => setLastOpenedVaultId('vault-123')).not.toThrow()
      expect(errorSpy).toHaveBeenCalled()
    })
  })

  describe('getLastOpenedVaultId', () => {
    it('returns null when nothing is stored', () => {
      expect(getLastOpenedVaultId()).toBeNull()
    })

    it('reads back a stored id', () => {
      setLastOpenedVaultId('vault-abc')
      expect(getLastOpenedVaultId()).toBe('vault-abc')
    })

    it('returns null and logs on read failure', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage unavailable')
      })

      expect(getLastOpenedVaultId()).toBeNull()
      expect(errorSpy).toHaveBeenCalled()
    })
  })
})
