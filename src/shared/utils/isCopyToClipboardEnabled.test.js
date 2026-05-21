import { isCopyToClipboardEnabled } from './isCopyToClipboardEnabled'
import { LOCAL_STORAGE_KEYS } from '../constants/storage'

const KEY = LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_ENABLED

describe('isCopyToClipboardEnabled', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns true when the key is not set', () => {
    expect(isCopyToClipboardEnabled()).toBe(true)
  })

  it('returns true when the key is set to "true"', () => {
    localStorage.setItem(KEY, 'true')
    expect(isCopyToClipboardEnabled()).toBe(true)
  })

  it('returns false when the key is set to "false"', () => {
    localStorage.setItem(KEY, 'false')
    expect(isCopyToClipboardEnabled()).toBe(false)
  })

  it('returns true when the key has an arbitrary non-"false" value', () => {
    localStorage.setItem(KEY, 'enabled')
    expect(isCopyToClipboardEnabled()).toBe(true)
  })
})
