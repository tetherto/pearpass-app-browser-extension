import { getLocaleFromStorage, setLocaleInStorage } from './localeStorage'
import { CHROME_STORAGE_KEYS } from '../constants/storage'

describe('localeStorage', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    }
  })

  afterEach(() => {
    delete global.chrome
    jest.clearAllMocks()
  })

  describe('getLocaleFromStorage', () => {
    it('returns stored locale string', async () => {
      chrome.storage.local.get.mockResolvedValue({
        [CHROME_STORAGE_KEYS.LOCALE]: 'it'
      })

      expect(await getLocaleFromStorage()).toBe('it')
    })

    it('returns null when key is absent from storage', async () => {
      chrome.storage.local.get.mockResolvedValue({})

      expect(await getLocaleFromStorage()).toBeNull()
    })

    it('returns null when stored value is an empty string', async () => {
      chrome.storage.local.get.mockResolvedValue({
        [CHROME_STORAGE_KEYS.LOCALE]: ''
      })

      expect(await getLocaleFromStorage()).toBeNull()
    })

    it('returns null when stored value is not a string', async () => {
      chrome.storage.local.get.mockResolvedValue({
        [CHROME_STORAGE_KEYS.LOCALE]: 42
      })

      expect(await getLocaleFromStorage()).toBeNull()
    })

    it('returns null when chrome storage is unavailable', async () => {
      global.chrome = undefined

      expect(await getLocaleFromStorage()).toBeNull()
    })

    it('returns null when chrome.storage.local.get is unavailable', async () => {
      global.chrome = { storage: { local: {} } }

      expect(await getLocaleFromStorage()).toBeNull()
    })
  })

  describe('setLocaleInStorage', () => {
    it('persists the locale to chrome storage', async () => {
      await setLocaleInStorage('en')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [CHROME_STORAGE_KEYS.LOCALE]: 'en'
      })
    })

    it('does nothing when chrome storage is unavailable', async () => {
      global.chrome = undefined

      await expect(setLocaleInStorage('en')).resolves.toBeUndefined()
    })

    it('does nothing when chrome.storage.local.set is unavailable', async () => {
      global.chrome = { storage: { local: {} } }

      await expect(setLocaleInStorage('en')).resolves.toBeUndefined()
    })
  })
})
