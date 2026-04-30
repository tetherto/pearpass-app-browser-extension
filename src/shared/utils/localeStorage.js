import { CHROME_STORAGE_KEYS } from '../constants/storage'

/**
 * Gets the persisted locale from Chrome storage.
 * @returns {Promise<string | null>} Promise that resolves to the stored locale code, or null if unset/unavailable.
 */
export const getLocaleFromStorage = async () => {
  if (!chrome?.storage?.local?.get) return null
  const res = await chrome.storage.local.get(CHROME_STORAGE_KEYS.LOCALE)
  const locale = res?.[CHROME_STORAGE_KEYS.LOCALE]
  return typeof locale === 'string' && locale ? locale : null
}

/**
 * Persists the active locale to Chrome storage.
 * @param {string} locale - BCP47-style language code (e.g. "en", "it").
 * @returns {Promise<void>}
 */
export const setLocaleInStorage = async (locale) => {
  if (!chrome?.storage?.local?.set) return
  await chrome.storage.local.set({
    [CHROME_STORAGE_KEYS.LOCALE]: locale
  })
}
