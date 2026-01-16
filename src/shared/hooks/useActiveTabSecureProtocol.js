import { useMemo } from 'react'

import { useActiveTabUrl } from './useActiveTabUrl'

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
