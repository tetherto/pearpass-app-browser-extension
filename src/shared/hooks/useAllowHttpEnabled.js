import { useState, useEffect, useCallback } from 'react'

import {
  getAllowHttpFromStorage,
  setAllowHttpInStorage,
  subscribeToAllowHttpStorage
} from '../utils/allowHttpStorage'

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
