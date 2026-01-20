import { useMemo } from 'react'

import { useActiveTabUrl } from './useActiveTabUrl'

/**
 * Hook that determines if the currently active browser tab is using a secure protocol (HTTPS).
 * It listens for URL changes in the active tab and parses the protocol.
 *
 * @returns {Object} An object containing:
 * @returns {boolean} .isSecure - True if the protocol is HTTPS or if the URL is still loading.
 * @returns {string|null} .currentUrl - The full URL of the active tab.
 */
export const useActiveTabSecureProtocol = () => {
  const { url: currentUrl } = useActiveTabUrl()

  const isSecure = useMemo(() => {
    if (!currentUrl) return true // Default to true if no URL (or loading)

    try {
      const url = new URL(currentUrl)
      const secure = url.protocol === 'https:'

      return secure
    } catch (e) {
      return false
    }
  }, [currentUrl])

  return { isSecure, currentUrl }
}
