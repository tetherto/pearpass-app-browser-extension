import {
  getAllowHttpFromStorage,
  setAllowHttpInStorage,
  subscribeToAllowHttpStorage
} from './allowHttpStorage'
import { CHROME_STORAGE_KEYS } from '../constants/storage'

describe('allowHttpStorage', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        },
        onChanged: {
          addListener: jest.fn(),
          removeListener: jest.fn()
        }
      }
    }
  })

  afterEach(() => {
    delete global.chrome
    jest.clearAllMocks()
  })

  describe('getAllowHttpFromStorage', () => {
    it('should return true when storage value is true', async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ [CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]: true })
      )
      const result = await getAllowHttpFromStorage()
      expect(result).toBe(true)
    })

    it('should return false when storage value is false or missing', async () => {
      chrome.storage.local.get.mockResolvedValue({})
      expect(await getAllowHttpFromStorage()).toBe(false)
    })

    it('should return false if chrome storage is unavailable', async () => {
      delete global.chrome.storage
      expect(await getAllowHttpFromStorage()).toBe(false)
    })
  })

  describe('setAllowHttpInStorage', () => {
    it('should call chrome.storage.local.set with correct key and value', async () => {
      await setAllowHttpInStorage(true)
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]: true
      })
    })
  })

  describe('subscribeToAllowHttpStorage', () => {
    it('should call callback only when the specific key changes in local storage', () => {
      let listener
      chrome.storage.onChanged.addListener.mockImplementation((fn) => {
        listener = fn
      })

      const callback = jest.fn()
      subscribeToAllowHttpStorage(callback)

      // Trigger change for wrong key
      listener({ otherKey: { newValue: true } }, 'local')
      expect(callback).not.toHaveBeenCalled()

      // Trigger change for wrong area
      listener(
        { [CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]: { newValue: true } },
        'sync'
      )
      expect(callback).not.toHaveBeenCalled()

      // Trigger correct change
      listener(
        { [CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]: { newValue: true } },
        'local'
      )
      expect(callback).toHaveBeenCalledWith(true)
    })

    it('should return an unsubscribe function that removes the listener', () => {
      const unsubscribe = subscribeToAllowHttpStorage(jest.fn())
      unsubscribe()
      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled()
    })
  })
})
