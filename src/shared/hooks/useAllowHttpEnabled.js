import { useState, useEffect, useCallback } from 'react'

import {
  getAllowHttpFromStorage,
  setAllowHttpInStorage,
  subscribeToAllowHttpStorage
} from '../utils/allowHttpStorage'

/**
 * Hook that manages the "Allow non-secure websites" setting.
 * It provides a synchronized state with Chrome storage and a setter function.
 *
 * @returns {[boolean, Function]} A tuple containing:
 * - isEnabled: Current state of the setting.
 * - updateEnabled: Function to update the setting in both state and storage.
 */
export const useAllowHttpEnabled = () => {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Initial fetch
    getAllowHttpFromStorage().then((value) => {
      setIsEnabled(value)
    })

    // Subscribe to changes
    const unsubscribe = subscribeToAllowHttpStorage((value) => {
      setIsEnabled(value)
    })
    return unsubscribe
  }, [])

  const updateEnabled = useCallback((newValue) => {
    // Optimistic update
    setIsEnabled(newValue)
    setAllowHttpInStorage(newValue).then(() => {})
  }, [])

  return [isEnabled, updateEnabled]
}
