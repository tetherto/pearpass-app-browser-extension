import { useEffect, useState, useCallback } from 'react'

/**
 * Hook that tracks the URL of the currently active browser tab.
 * It automatically updates when the tab's URL changes or when the user switches tabs.
 *
 * @returns {Object} An object containing:
 * @returns {string} .url - The current active tab's URL (or empty string if unavailable).
 * @returns {boolean} .loading - True while the initial URL is being fetched.
 * @returns {Function} .refetch - A function to manually trigger a URL refresh.
 */
export const useActiveTabUrl = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const updateUrl = useCallback(() => {
    setLoading(true)

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]

      if (!tab) {
        setUrl('')
        setLoading(false)
        return
      }

      if (tab.url) {
        setUrl(tab.url)
      } else if (tab.pendingUrl) {
        setUrl(tab.pendingUrl)
      }
      // URL restricted (chrome:// pages, etc.)
      else {
        setUrl('')
      }

      setLoading(false)
    })
  }, [])

  useEffect(() => {
    updateUrl()

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.url || changeInfo.status === 'complete') {
        updateUrl()
      }
    })

    chrome.tabs.onActivated.addListener(() => {
      updateUrl()
    })
  }, [updateUrl])

  return { url, loading, refetch: updateUrl }
}
