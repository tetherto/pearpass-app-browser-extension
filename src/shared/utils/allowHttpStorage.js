import { CHROME_STORAGE_KEYS } from '../constants/storage'

/**
 * Gets the current allow HTTP enabled state from Chrome storage
 * @returns {Promise<boolean>} Promise that resolves to true if HTTP is allowed, false otherwise. Defaults to false if storage is unavailable.
 */
export const getAllowHttpFromStorage = async () => {
  if (!chrome?.storage?.local?.get) return false
  const res = await chrome.storage.local.get(
    CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED
  )
  const enabled = res?.[CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]
  return enabled === true
}

/**
 * Sets the allow HTTP enabled state in Chrome storage
 * @param {boolean} isEnabled - Whether HTTP should be allowed
 * @returns {Promise<void>} Promise that resolves when the value is set
 */
export const setAllowHttpInStorage = async (isEnabled) => {
  if (!chrome?.storage?.local?.set) return
  await chrome.storage.local.set({
    [CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]: isEnabled
  })
}

/**
 * Subscribes to changes in the allow HTTP enabled setting in Chrome storage
 * @param {function(boolean): void} cb - Callback that receives the new enabled state
 * @returns {function(): void} Unsubscribe function to remove the listener
 */
export const subscribeToAllowHttpStorage = (cb) => {
  if (!chrome?.storage?.onChanged?.addListener) return () => {}
  const handler = (changes, area) => {
    if (area !== 'local') return
    if (CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED in changes) {
      const newVal = changes[CHROME_STORAGE_KEYS.ALLOW_HTTP_ENABLED]?.newValue
      cb(newVal === true)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => {
    chrome.storage.onChanged.removeListener(handler)
  }
}
