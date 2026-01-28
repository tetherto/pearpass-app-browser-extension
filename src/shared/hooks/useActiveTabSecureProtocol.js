import { useMemo } from 'react'

import { useActiveTabUrl } from './useActiveTabUrl'

/**
 * Hook that determines if the currently active browser tab is using a secure protocol.
 * It listens for URL changes in the active tab and parses the protocol.
 *
 * Protocol security rules:
 * - `https:` → Secure (true)
 * - `http:` → Insecure (false)
 * - All other protocols (`chrome:`, `about:`, `file:`, etc.) → Treated as secure (true),
 *   since they represent non-web contexts (e.g., browser internals, local files).
 *
 * @returns {Object} An object containing:
 * @returns {boolean} .isSecure - True if protocol is HTTPS or non-HTTP/S; false only for HTTP.
 * @returns {string|null} .currentUrl - The full URL of the active tab.
 */
export const useActiveTabSecureProtocol = () => {
  const { url: currentUrl } = useActiveTabUrl()

  const isSecure = useMemo(() => {
    if (!currentUrl) return true // Default to true if no URL (or loading)

    try {
      const url = new URL(currentUrl)
      const protocol = url.protocol

      if (protocol === 'https:') return true
      if (protocol === 'http:') return false

      // All others (chrome:, about:, file:, etc.): treat as secure
      return true
    } catch {
      return false
    }
  }, [currentUrl])

  return { isSecure, currentUrl }
}
