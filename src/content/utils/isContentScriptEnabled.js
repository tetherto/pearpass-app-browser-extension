import { getAllowHttpFromStorage } from '../../shared/utils/allowHttpStorage'

/**
 * Checks if the content script should be enabled for the current page.
 * The content script is enabled if the page uses a secure protocol (HTTPS)
 * or if the "Allow non-secure websites" setting is enabled in storage.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the content script is enabled, false otherwise.
 */
export const isContentScriptEnabled = async () => {
  const isSecure = window.location.protocol === 'https:'
  const isAllowHttpEnabled = await getAllowHttpFromStorage()

  return isSecure || isAllowHttpEnabled
}
